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
import {AiMatchingScheduler} from './ai-matching.scheduler';
import { UploadModule } from 'src/upload/upload.module';
import { InterviewsModule } from '../interviews/interviews.module';
@Module({
  imports: [
    HttpModule,
    UploadModule,
    forwardRef(() => InterviewsModule),
    MongooseModule.forFeature([
      { name: UserJobScore.name, schema: UserJobScoreSchema },
      { name: Job.name, schema: JobSchema },
      { name: Candidate.name, schema: CandidateSchema },
    ]),
  ],
  providers: [AiServiceClient, AiMatchingService, AiMatchingScheduler],
  exports: [AiMatchingService],
})
export class AiMatchingModule {}
