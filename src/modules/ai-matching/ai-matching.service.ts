import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';
import { UserJobScore, UserJobScoreDocument } from 'src/database/schemas/user_job_score.schema';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import { Candidate, CandidateDocument } from 'src/database/schemas/candidate.schema';

@Injectable()
export class AiMatchingService {
  private readonly logger = new Logger(AiMatchingService.name);
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    @InjectModel(UserJobScore.name)
    private readonly userJobScoreModel: Model<UserJobScoreDocument>,
    @InjectModel(Job.name)
    private readonly jobModel: Model<JobDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
  ) {
    this.aiServiceUrl = this.configService.get<string>('AI_SERVICE_URL') || 'http://localhost:8000';
  }

  /**
   * Triggers matching for a specific candidate against all available jobs.
   */
  async computeScoresForCandidate(candidate: CandidateDocument): Promise<void> {
    const cvUrl = candidate.cvFileUrl;
    if (!cvUrl) {
      this.logger.warn(`Candidate ${candidate._id} has no CV URL. Skipping matching.`);
      return;
    }

    const jobs = await this.jobModel.find({ status: 'OPEN' }).exec();
    if (jobs.length === 0) {
      this.logger.log('No open jobs found to match against.');
      return;
    }

    const payload = {
      cv_url: cvUrl,
      jobs: jobs.map((job) => ({
        job_id: job._id.toString(),
        description: `${job.roleContext}\n\n${job.coreResponsibilities}`,
        required_skills: job.skills,
      })),
    };

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/jobs/match`, payload),
      );

      const results: any[] = response.data.recommendations || response.data; // Handle different response formats

      for (const result of results) {
        await this.userJobScoreModel.updateOne(
          { candidateId: candidate._id, jobId: result.job_id },
          {
            score: result.match_score,
            matchedSkills: result.matched_skills || [],
            updatedAt: new Date(),
          },
          { upsert: true },
        );
      }
      this.logger.log(`Updated scores for candidate ${candidate._id}`);
    } catch (error) {
      this.logger.error(`Failed to call AI service for candidate ${candidate._id}: ${error.message}`);
    }
  }

  /**
   * Triggers matching for a new job against all available candidates.
   */
  async computeScoresForJob(job: JobDocument): Promise<void> {
    const candidates = await this.candidateModel.find({ cvFileUrl: { $exists: true, $ne: null } }).exec();
    
    for (const candidate of candidates) {
      // In a real scenario, we might want to batch this or send only this job to the AI service
      // But the requirement says: "Send CV + this job (or jobs list) to AI"
      const payload = {
        cv_url: candidate.cvFileUrl,
        jobs: [
          {
            job_id: job._id.toString(),
            description: `${job.roleContext}\n\n${job.coreResponsibilities}`,
            required_skills: job.skills,
          },
        ],
      };

      try {
        const response = await firstValueFrom(
          this.httpService.post(`${this.aiServiceUrl}/jobs/match`, payload),
        );

        const results: any[] = response.data.recommendations || response.data;
        const result = results[0];

        if (result) {
          await this.userJobScoreModel.updateOne(
            { candidateId: candidate._id, jobId: job._id },
            {
              score: result.match_score,
              matchedSkills: result.matched_skills || [],
              updatedAt: new Date(),
            },
            { upsert: true },
          );
        }
      } catch (error) {
        this.logger.error(`Failed to call AI service for candidate ${candidate._id} on new job ${job._id}: ${error.message}`);
      }
    }
    this.logger.log(`Updated scores for all candidates for new job ${job._id}`);
  }
}
