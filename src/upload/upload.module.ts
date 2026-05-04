import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { S3Module } from '../s3/s3.module';
import { AuthModule } from 'src/modules/auth/auth.module';
// import { UploadQueueModule } from 'src/queues/upload-queue/queue.module';
// import { UploadProcessor } from 'src/queues/upload-queue/processor/upload.processor';
import { AiMatchingModule } from 'src/modules/ai-matching/ai-matching.module';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Candidate,
  CandidateSchema,
} from 'src/database/schemas/candidate.schema';

@Module({
  imports: [
    S3Module,
    AuthModule,
    AiMatchingModule,
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
    ]),
  ],
  providers: [UploadService],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
