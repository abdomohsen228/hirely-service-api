import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { JobService } from './job.service';

@Injectable()
export class JobScheduler {

  constructor(
    private readonly jobService: JobService,
  ) {}

  @Cron('0 0 * * *')
  async closeExpiredJobs() {
    await this.jobService.closeExpiredJobs();
  }

  @Cron('0 0 * * *')
  async openInterviewPhase() {
    await this.jobService.openInterviewPhase();
  }

  @Cron('0 0 * * *')
  async closeInterviewPhase() {
    await this.jobService.closeInterviewPhase();
  }
}