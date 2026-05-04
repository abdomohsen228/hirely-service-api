import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { UploadProducer } from './producer/upload.producer';
import { UPLOAD_QUEUE } from '../queue.constants';

@Module({
  imports: [
    BullModule.registerQueue({
      name: UPLOAD_QUEUE,
    }),
  ],
  providers: [UploadProducer],
  exports: [UploadProducer],
})
export class UploadQueueModule {}
