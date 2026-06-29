import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserJobScore,
  UserJobScoreDocument,
} from 'src/database/schemas/user_job_score.schema';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import {
  Candidate,
  CandidateDocument,
} from 'src/database/schemas/candidate.schema';
import {
  JobApplication,
  JobApplicationDocument,
} from 'src/database/schemas/application.schema';
import {
  VideoAiAnalysis,
  VideoAiAnalysisDocument,
} from 'src/database/schemas/video_ai_analysis.schema';
import { AiServiceClient } from './ai-service.client';
import {
  JobMatchCallContext,
  JobMatchJobInput,
  JobMatchRecommendation,
} from './types/job-match.types';
import { UploadService } from 'src/upload/upload.service';
import { InterviewsService } from '../interviews/interviews.service';

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);

  constructor(
    private readonly aiServiceClient: AiServiceClient,
    @InjectModel(UserJobScore.name)
    private readonly userJobScoreModel: Model<UserJobScoreDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(VideoAiAnalysis.name)
    private readonly videoAiAnalysisModel: Model<VideoAiAnalysisDocument>,
    private readonly uploadService: UploadService,
    private readonly interviewService: InterviewsService,
  ) {}

  /**
   * Triggers matching for a specific candidate against all available jobs.
   */
  async computeScoresForCandidate(candidate: CandidateDocument): Promise<void> {
    if (!candidate.user) {
      this.logger.warn(
        `[candidate_cv_upload] Candidate ${candidate._id} has no linked user. Skipping matching.`,
      );
      return;
    }

    const cvUrl = await this.uploadService.getCvUrl(candidate.user.toString());
    if (!cvUrl) {
      this.logger.warn(
        `[candidate_cv_upload] Candidate ${candidate._id} has no CV URL. Skipping matching.`,
      );
      return;
    }

    const jobs = await this.jobModel.find({ status: 'OPEN' }).exec();
    if (jobs.length === 0) {
      this.logger.log(
        `[candidate_cv_upload] No open jobs found for candidate ${candidate._id}.`,
      );
      return;
    }

    const jobInputs = jobs.map((job) => this.toJobMatchInput(job));
    const context: JobMatchCallContext = {
      trigger: 'candidate_cv_upload',
      candidateId: candidate._id.toString(),
      jobIds: jobInputs.map((job) => job.job_id),
    };

    this.logger.log(
      `[candidate_cv_upload] Starting match for candidate ${candidate._id} against ${jobs.length} open job(s).`,
    );

    try {
      const recommendations = await this.aiServiceClient.matchJobs(
        { cv_url: String(cvUrl), jobs: jobInputs },
        context,
      );

      await this.saveRecommendations(candidate._id, recommendations, context);
      this.logger.log(
        `[candidate_cv_upload] Finished matching for candidate ${candidate._id}.`,
      );
    } catch {
      // Errors are already logged by AiServiceClient.
    }
  }

  /**
   * Triggers matching for a new job against all candidates with a CV.
   */
  async computeScoresForJob(job: JobDocument): Promise<void> {
    const candidates = await this.candidateModel
      .find({ user: { $exists: true, $ne: null } })
      .exec();

    this.logger.log(
      `[create_job] Starting match for job ${job._id} against ${candidates.length} candidate(s).`,
    );

    const jobInput = this.toJobMatchInput(job);

    for (const candidate of candidates) {
      const context: JobMatchCallContext = {
        trigger: 'create_job',
        candidateId: candidate._id.toString(),
        jobIds: [jobInput.job_id],
      };

      try {
        const cvUrl = await this.uploadService.getCvUrl(
          candidate.user.toString(),
        );
        if (!cvUrl) {
          this.logger.warn(
            `[create_job] Candidate ${candidate._id} has no CV URL. Skipping.`,
          );
          continue;
        }

        const recommendations = await this.aiServiceClient.matchJobs(
          {
            cv_url: String(cvUrl),
            jobs: [jobInput],
          },
          context,
        );

        await this.saveRecommendations(candidate._id, recommendations, context);
      } catch {
        // Errors are already logged by AiServiceClient.
      }
    }

    this.logger.log(
      `[create_job] Finished matching job ${job._id} for all candidates.`,
    );
  }

  private toJobMatchInput(job: JobDocument): JobMatchJobInput {
    return {
      job_id: job._id.toString(),
      description: `${job.roleContext}\n\n${job.coreResponsibilities}`,
      required_skills: job.skills ?? [],
    };
  }

  private async saveRecommendations(
    candidateId: CandidateDocument['_id'],
    recommendations: JobMatchRecommendation[],
    context: JobMatchCallContext,
  ): Promise<void> {
    for (const recommendation of recommendations) {
      await this.userJobScoreModel.updateOne(
        { candidateId, jobId: recommendation.job_id },
        {
          score: recommendation.match_score,
          matchedSkills: recommendation.matched_skills ?? [],
          updatedAt: new Date(),
        },
        { upsert: true },
      );

      this.logger.log(
        `[${context.trigger}] Saved UserJobScore | candidateId=${candidateId.toString()} | jobId=${recommendation.job_id} | score=${recommendation.match_score}`,
      );
    }
  }
  /*
    GET URLS FROM INTERVIEW SERVICE BY APPLICATION ID
    CONVERT THESE IDS USING UPLOAD SERVICE FUNCTION
  */

  /**
   * Process video analysis for a specific application
   */
  async processVideosForApplication(
    applicationId: Types.ObjectId,
  ): Promise<void> {
    const application = await this.jobApplicationModel.findById(applicationId);
    if (!application) {
      this.logger.warn(
        `[video_analysis] Application ${applicationId} not found. Skipping.`,
      );
      return;
    }

    if (application.videosProcessedByAi) {
      this.logger.log(
        `[video_analysis] Application ${applicationId} already processed. Skipping.`,
      );
      return;
    }

    // Get interview responses for this application
    const interviewResponses =
      await this.interviewService.getInterviewResponsesByApplication(
        application._id,
      );

    if (interviewResponses.size === 0) {
      this.logger.log(
        `[video_analysis] No interview responses found for application ${applicationId}. Skipping.`,
      );
      return;
    }

    // Build video URLs from S3 keys
    const videoUrls: string[] = [];
    for (const [, response] of interviewResponses) {
      if (response.response) {
        const videoUrl = await this.uploadService.getVideoUrl(response.response, response.responseOrder);
        if (videoUrl) {
          videoUrls.push(videoUrl);
        }
      }
    }

    if (videoUrls.length === 0) {
      this.logger.warn(
        `[video_analysis] No valid video URLs found for application ${applicationId}. Skipping.`,
      );
      return;
    }

    const candidate = await this.candidateModel.findById(application.candidateId);
    if (!candidate || !candidate.user) {
      this.logger.warn(
        `[video_analysis] Candidate not found for application ${applicationId}. Skipping.`,
      );
      return;
    }

    const userId = candidate.user.toString();

    try {
      const analysisResponse = await this.aiServiceClient.analyzeVideos(
        {
          video_urls: videoUrls,
          user_id: userId,
          whisper_model: 'base.en',
        },
        {
          applicationId: application._id.toString(),
          candidateId: candidate._id.toString(),
        },
      );

      // Save analysis results for each video
      for (const videoResult of analysisResponse.videos) {
        await this.videoAiAnalysisModel.create({
          applicationId: application._id,
          candidateId: candidate._id,
          videoUrl: videoResult.video_url,
          bodyLanguage: videoResult.body_language,
          audio: videoResult.audio,
          overallInterviewScore: videoResult.overall_interview_score,
          conclusion: analysisResponse.conclusion,
          identityVerification: analysisResponse.identity_verification,
          warning: analysisResponse.warning,
          feedback: analysisResponse.feedback,
          feedbackError: analysisResponse.feedback_error,
        });
      }

      // Mark application as processed
      application.videosProcessedByAi = true;
      await application.save();

      this.logger.log(
        `[video_analysis] Successfully processed ${analysisResponse.videos.length} videos for application ${applicationId}. Overall score: ${analysisResponse.overall_interview_score}`,
      );
    } catch (error) {
      this.logger.error(
        `[video_analysis] Failed to process videos for application ${applicationId}: ${error}`,
      );
    }
  }

  /**
   * Process all applications that have videos but haven't been processed by AI yet
   * Called by cron job every minute
   * Processes videos per user (max 5 videos per user)
   */
  async processPendingVideoAnalyses(): Promise<void> {
    this.logger.log('[video_analysis] Starting pending video analysis check...');

    // Find all candidates who have applications with interviewed=true and videosProcessedByAi=false
    const applications = await this.jobApplicationModel
      .find({
        interviewed: true,
        videosProcessedByAi: false,
      })
      .exec();

    this.logger.log(
      `[video_analysis] Found ${applications.length} applications pending video analysis.`,
    );

    // Group applications by candidate
    const applicationsByCandidate = new Map<
      Types.ObjectId,
      JobApplicationDocument[]
    >();
    for (const application of applications) {
      const candidateId = application.candidateId;
      if (!applicationsByCandidate.has(candidateId)) {
        applicationsByCandidate.set(candidateId, []);
      }
      applicationsByCandidate.get(candidateId)!.push(application);
    }

    this.logger.log(
      `[video_analysis] Processing videos for ${applicationsByCandidate.size} unique candidates.`,
    );

    // Process each candidate (max 5 videos per user)
    for (const [candidateId, candidateApplications] of applicationsByCandidate) {
      await this.processVideosForCandidate(candidateId, candidateApplications);
    }

    this.logger.log('[video_analysis] Pending video analysis check completed.');
  }

  /**
   * Process video analysis for a specific candidate across all their applications
   * Limits to max 5 videos per candidate
   */
  async processVideosForCandidate(
    candidateId: Types.ObjectId,
    applications: JobApplicationDocument[],
  ): Promise<void> {
    const candidate = await this.candidateModel.findById(candidateId);
    if (!candidate || !candidate.user) {
      this.logger.warn(
        `[video_analysis] Candidate ${candidateId} not found or has no user. Skipping.`,
      );
      return;
    }

    const userId = candidate.user.toString();

    // Collect all video URLs from all applications for this candidate
    const videoUrls: string[] = [];
    const applicationIds: Types.ObjectId[] = [];

    for (const application of applications) {
      if (application.videosProcessedByAi) {
        continue;
      }

      // Get interview responses for this application
      const interviewResponses =
        await this.interviewService.getInterviewResponsesByApplication(
          application._id,
        );

      for (const [, response] of interviewResponses) {
        if (response.response) {
          const videoUrl = await this.uploadService.getVideoUrlByKey(
            response.response,
          );
          if (videoUrl) {
            videoUrls.push(videoUrl);
            applicationIds.push(application._id);
          }
        }
      }

      // Limit to max 5 videos per user
      if (videoUrls.length >= 5) {
        break;
      }
    }

    if (videoUrls.length === 0) {
      this.logger.log(
        `[video_analysis] No valid video URLs found for candidate ${candidateId}. Skipping.`,
      );
      return;
    }

    try {
      const analysisResponse = await this.aiServiceClient.analyzeVideos(
        {
          video_urls: videoUrls,
          user_id: userId,
          whisper_model: 'base.en',
        },
        {
          applicationId: applicationIds[0].toString(),
          candidateId: candidate._id.toString(),
        },
      );

      // Save analysis results for each video
      for (const videoResult of analysisResponse.videos) {
        await this.videoAiAnalysisModel.create({
          applicationId: applicationIds[0],
          candidateId: candidate._id,
          videoUrl: videoResult.video_url,
          bodyLanguage: videoResult.body_language,
          audio: videoResult.audio,
          overallInterviewScore: videoResult.overall_interview_score,
          conclusion: analysisResponse.conclusion,
          identityVerification: analysisResponse.identity_verification,
          warning: analysisResponse.warning,
          feedback: analysisResponse.feedback,
          feedbackError: analysisResponse.feedback_error,
        });
      }

      // Mark all involved applications as processed
      for (const appId of applicationIds) {
        await this.jobApplicationModel.updateOne(
          { _id: appId },
          { videosProcessedByAi: true },
        );
      }

      this.logger.log(
        `[video_analysis] Successfully processed ${analysisResponse.videos.length} videos for candidate ${candidateId} (${userId}). Overall score: ${analysisResponse.overall_interview_score}`,
      );
    } catch (error) {
      this.logger.error(
        `[video_analysis] Failed to process videos for candidate ${candidateId}: ${error}`,
      );
    }
  }
}
