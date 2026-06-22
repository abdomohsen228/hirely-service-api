import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  JobApplication,
  JobApplicationSchema,
} from 'src/database/schemas/application.schema';
import {
  Candidate,
  CandidateSchema,
} from 'src/database/schemas/candidate.schema';
import {
  CandidateInterview,
  CandidateInterviewSchema,
} from 'src/database/schemas/candidate_interview.schema';
import {
  InterviewQuestion,
  InterviewQuestionSchema,
} from 'src/database/schemas/interview_questions.schema';
import {
  InterviewResponse,
  InterviewResponseSchema,
} from 'src/database/schemas/interview_responses.schema';
import { Job, JobSchema } from 'src/database/schemas/jobs.schema';
import { AuthModule } from '../auth/auth.module';
import { S3Module } from 'src/s3/s3.module';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';

@Module({
  imports: [
    AuthModule,
    S3Module,
    MongooseModule.forFeature([
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Job.name, schema: JobSchema },
      { name: InterviewQuestion.name, schema: InterviewQuestionSchema },
      { name: CandidateInterview.name, schema: CandidateInterviewSchema },
      { name: InterviewResponse.name, schema: InterviewResponseSchema },
    ]),
  ],
  controllers: [InterviewsController],
  providers: [InterviewsService],
  exports: [InterviewsService],
})
export class InterviewsModule {}
