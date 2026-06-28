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

@Module({
  imports: [
    S3Module,
    forwardRef(() => AuthModule),
    // UploadQueueModule,
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  providers: [UploadService, // UploadProcessor
  ],
  controllers: [UploadController],
  exports: [UploadService],
})
export class UploadModule {}
