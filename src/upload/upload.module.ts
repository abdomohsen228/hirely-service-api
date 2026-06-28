import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { S3Module } from '../s3/s3.module';
// import { UploadQueueModule } from 'src/queues/upload-queue/queue.module';
// import { UploadProcessor } from 'src/queues/upload-queue/processor/upload.processor';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Candidate,
  CandidateSchema,
} from 'src/database/schemas/candidate.schema';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
import { forwardRef } from '@nestjs/common';
import { JobApplicationSchema, JobApplication } from 'src/database/schemas/application.schema';
import { CandidateInterviewSchema, CandidateInterview } from 'src/database/schemas/candidate_interview.schema';
import { InterviewResponseSchema, InterviewResponse } from 'src/database/schemas/interview_responses.schema';

@Module({
  imports: [
    S3Module,
    forwardRef(() => AuthModule),
    // UploadQueueModule,
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: User.name, schema: UserSchema },
      { name: JobApplication.name, schema: JobApplicationSchema},
      { name: InterviewResponse.name, schema: InterviewResponseSchema},
      { name: CandidateInterview.name, schema: CandidateInterviewSchema},
    ]),
  ],
  providers: [UploadService, // UploadProcessor
  ],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
