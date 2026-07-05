import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InterviewsService } from './interviews.service';

@Injectable()
export class InterviewScheduler {

  constructor(
    private readonly interviewService: InterviewsService,
  ) {}

  @Cron('0 0 * * *')
  async closeExpiredJobs() {
    await this.interviewService.updateEvaluatedApplications();
  }


}