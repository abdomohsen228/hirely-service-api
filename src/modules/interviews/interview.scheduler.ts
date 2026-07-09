import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InterviewsService } from './interviews.service';

@Injectable()
export class InterviewScheduler {
  private readonly logger = new Logger(InterviewScheduler.name);
  constructor(private readonly interviewService: InterviewsService) {}

  @Cron('* * * * *')
  async updateEvaluatedApplications() {
    this.logger.log('Running scheduled task: updateEvaluatedJobs');
    await this.interviewService.updateEvaluatedApplications();
  }
}
