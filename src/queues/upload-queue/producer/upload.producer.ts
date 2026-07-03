import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { UploadJobs, UPLOAD_QUEUE } from 'src/queues/queue.constants';

@Injectable()
export class UploadProducer {
  constructor(@InjectQueue(UPLOAD_QUEUE) private uploadQueue: Queue) {}

  async validateUpload(data: any) {
    console.log('Adding upload validation job to the queue with data:', data);
    if( process.env.NODE_ENV === 'production') {
      await this.uploadQueue.add(UploadJobs.VALIDATE_UPLOAD, data);
      return { message: 'Upload validation job added to the queue' };
    }
  }
}
