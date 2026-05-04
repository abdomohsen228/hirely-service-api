import { Processor } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { UPLOAD_QUEUE } from 'src/queues/queue.constants';
import { WorkerHost } from '@nestjs/bullmq';
import { UploadService } from 'src/upload/upload.service';
import { UploadJobs } from 'src/queues/queue.constants';

@Processor(UPLOAD_QUEUE)
export class UploadProcessor extends WorkerHost {
  constructor(private readonly uploadService: UploadService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    if (job.name === UploadJobs.VALIDATE_UPLOAD) {
      const { Key, Status, Type, Reason } = job.data;
      await this.uploadValidation(Key, Status, Type, Reason);
    }
  }

  async uploadValidation(
    key: string,
    status: string,
    type: string,
    reason: string,
  ) {
    if (type === 'image') {
      await this.uploadService.validateProfileUpload(key, status, reason);
    } else if (type === 'cv') {
      await this.uploadService.validateCvUpload(key, status, reason);
    } else {
      //   await this.uploadService.validateVideoUpload(key, status, reason);
    }
  }
}
