import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AiMatchingService } from './ai-matching.service';
import { AiServiceClient } from './ai-service.client';
import {
  UserJobScore,
  UserJobScoreSchema,
} from 'src/database/schemas/user_job_score.schema';
import { Job, JobSchema } from 'src/database/schemas/jobs.schema';
import {
  Candidate,
  CandidateSchema,
} from 'src/database/schemas/candidate.schema';
import {
  JobApplication,
  JobApplicationSchema,
} from 'src/database/schemas/application.schema';
import {
  VideoAiAnalysis,
  VideoAiAnalysisSchema,
} from 'src/database/schemas/video_ai_analysis.schema';
import {AiMatchingScheduler} from './ai-matching.scheduler';
import { UploadModule } from 'src/upload/upload.module';
import { InterviewsModule } from '../interviews/interviews.module';
import { EmailModule } from '../email/email.module';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { InterviewResponse, InterviewResponseSchema } from 'src/database/schemas/interview_responses.schema';
@Module({
  imports: [
    HttpModule,
    UploadModule,
    forwardRef(() => InterviewsModule),
    EmailModule,
    MongooseModule.forFeature([
      { name: UserJobScore.name, schema: UserJobScoreSchema },
      { name: Job.name, schema: JobSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: VideoAiAnalysis.name, schema: VideoAiAnalysisSchema },
      { name: User.name, schema: UserSchema },
      { name: InterviewResponse.name, schema: InterviewResponseSchema },
    ]),
  ],
  providers: [AiServiceClient, AiMatchingService, AiMatchingScheduler],
  exports: [AiMatchingService],
})
export class AiMatchingModule {}
