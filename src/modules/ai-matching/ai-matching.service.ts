import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserJobScore,
  UserJobScoreDocument,
} from 'src/database/schemas/user_job_score.schema';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import {
  Candidate,
  CandidateDocument,
} from 'src/database/schemas/candidate.schema';
import { AiServiceClient } from './ai-service.client';
import {
  JobMatchCallContext,
  JobMatchJobInput,
  JobMatchRecommendation,
} from './types/job-match.types';
import { UploadService } from 'src/upload/upload.service';
import { Inject, forwardRef } from '@nestjs/common';

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);
  private readonly uploadService: UploadService;

  constructor(
    private readonly aiServiceClient: AiServiceClient,
    @InjectModel(UserJobScore.name)
    private readonly userJobScoreModel: Model<UserJobScoreDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
  ) {}

  /**
   * Triggers matching for a specific candidate against all available jobs.
   */
  async computeScoresForCandidate(candidate: CandidateDocument): Promise<void> {
    const cvUrl = this.uploadService.getCvUrl(String(candidate._id));
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
      .find({ cvFileUrl: { $exists: true, $ne: null } })
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
        const recommendations = await this.aiServiceClient.matchJobs(
          {
            cv_url: String(this.uploadService.getCvUrl(String(candidate._id))),
            jobs: [jobInput],
          },
          context,
        );

        await this.saveRecommendations(
          candidate._id,
          recommendations,
          context,
        );
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
}
