import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { JobService } from './job.service';

@Injectable()
export class JobScheduler {

  constructor(
    private readonly jobService: JobService,
  ) {}

  @Cron('* * * * *')
  async closeExpiredJobs() {
    await this.jobService.closeExpiredJobs();
  }

  @Cron('* * * * *')
  async openInterviewPhase() {
    await this.jobService.openInterviewPhase();
  }

  @Cron('* * * * *')
  async closeInterviewPhase() {
    await this.jobService.closeInterviewPhase();
  }
}