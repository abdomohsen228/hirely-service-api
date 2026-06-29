import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import {
  JobMatchCallContext,
  JobMatchRecommendation,
  JobMatchRequest,
  JobMatchResponse,
} from './types/job-match.types';
import {
  VideoAnalysisRequest,
  VideoAnalysisResponse,
} from './types/video-analysis.types';

@Injectable()
export class AiServiceClient {
  private readonly logger = new Logger(AiServiceClient.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.aiServiceUrl =
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://127.0.0.1:8000';
  }

  async matchJobs(
    payload: JobMatchRequest,
    context: JobMatchCallContext,
  ): Promise<JobMatchRecommendation[]> {
    const endpoint = `${this.aiServiceUrl}/jobs/match`;
    const startedAt = Date.now();

    this.logger.log(
      `[${context.trigger}] POST ${endpoint} | candidateId=${context.candidateId} | jobIds=[${context.jobIds.join(', ')}]`,
    );
    this.logger.debug(
      `[${context.trigger}] Request payload: ${JSON.stringify(payload)}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<JobMatchResponse>(endpoint, payload),
      );
      const durationMs = Date.now() - startedAt;
      const recommendations = response.data?.recommendations ?? [];

      this.logger.log(
        `[${context.trigger}] AI match succeeded in ${durationMs}ms | candidateId=${context.candidateId} | recommendations=${recommendations.length}`,
      );
      this.logger.debug(
        `[${context.trigger}] Response: ${JSON.stringify(response.data)}`,
      );

      for (const recommendation of recommendations) {
        this.logger.log(
          `[${context.trigger}] jobId=${recommendation.job_id} | matchScore=${recommendation.match_score} | matchedSkills=[${(recommendation.matched_skills ?? []).join(', ')}]`,
        );
      }

      return recommendations;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = this.formatError(error);

      this.logger.error(
        `[${context.trigger}] AI match failed in ${durationMs}ms | candidateId=${context.candidateId} | jobIds=[${context.jobIds.join(', ')}] | error=${message}`,
      );

      throw error;
    }
  }

  async analyzeVideos(
    payload: VideoAnalysisRequest,
    context: { applicationId: string; candidateId: string },
  ): Promise<VideoAnalysisResponse> {
    const endpoint = `${this.aiServiceUrl}/video/analyze`;
    const startedAt = Date.now();

    this.logger.log(
      `[video_analysis] POST ${endpoint} | applicationId=${context.applicationId} | candidateId=${context.candidateId} | videos=${payload.video_urls.length}`,
    );
    this.logger.debug(
      `[video_analysis] Request payload: ${JSON.stringify(payload)}`,
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post<VideoAnalysisResponse>(endpoint, payload),
      );
      const durationMs = Date.now() - startedAt;

      this.logger.log(
        `[video_analysis] AI video analysis succeeded in ${durationMs}ms | applicationId=${context.applicationId} | overallScore=${response.data.overall_interview_score}`,
      );
      this.logger.debug(
        `[video_analysis] Response: ${JSON.stringify(response.data)}`,
      );

      return response.data;
    } catch (error) {
      const durationMs = Date.now() - startedAt;
      const message = this.formatError(error);

      this.logger.error(
        `[video_analysis] AI video analysis failed in ${durationMs}ms | applicationId=${context.applicationId} | candidateId=${context.candidateId} | error=${message}`,
      );

      throw error;
    }
  }

  private formatError(error: unknown): string {
    if (error instanceof AxiosError) {
      const status = error.response?.status;
      const body =
        typeof error.response?.data === 'string'
          ? error.response.data
          : JSON.stringify(error.response?.data ?? {});

      return status
        ? `HTTP ${status}: ${body || error.message}`
        : error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    return String(error);
  }
}
