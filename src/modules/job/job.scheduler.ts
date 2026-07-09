import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { JobService } from './job.service';

@Injectable()
export class JobScheduler {
  private readonly logger = new Logger(JobScheduler.name);
  constructor(private readonly jobService: JobService) {}

  @Cron('* * * * *')
  async closeExpiredJobs() {
    this.logger.log('Running scheduled task: CloseEcpiredJobs');
    await this.jobService.closeExpiredJobs();
  }

  @Cron('* * * * *')
  async openInterviewPhase() {
    this.logger.log('Running scheduled task: OpenInterviewPhase');
    await this.jobService.openInterviewPhase();
  }

  @Cron('* * * * *')
  async closeInterviewPhase() {
    this.logger.log('Running scheduled task: closeInterviewPhase');
    await this.jobService.closeInterviewPhase();
  }
}
