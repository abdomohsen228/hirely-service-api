import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { MongooseModule } from '@nestjs/mongoose';
import { AiMatchingService } from './ai-matching.service';
import {
  UserJobScore,
  UserJobScoreSchema,
} from 'src/database/schemas/user_job_score.schema';
import { Job, JobSchema } from 'src/database/schemas/jobs.schema';
import {
  Candidate,
  CandidateSchema,
} from 'src/database/schemas/candidate.schema';
import { JobApplication, JobApplicationSchema } from 'src/database/schemas/application.schema';

@Module({
  imports: [
    HttpModule,
    MongooseModule.forFeature([
      { name: UserJobScore.name, schema: UserJobScoreSchema },
      { name: Job.name, schema: JobSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: JobApplication.name, schema: JobApplicationSchema}
    ]),
  ],
  providers: [AiMatchingService],
  exports: [AiMatchingService],
})
export class AiMatchingModule {}
