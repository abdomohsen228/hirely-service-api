import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { AiMatchingService } from './ai-matching.service';

@Injectable()
export class AiMatchingScheduler {
  private readonly logger = new Logger(AiMatchingScheduler.name);
  constructor(private readonly aiMatchingService: AiMatchingService) {}

  //   @Cron('0 0 * * *')
  //   async screenApplications() {
  //     this.logger.log('Running scheduled task: screenApplications');
  //     await this.aiMatchingService.screenApplications();
  //   }

  @Cron('*/10 * * * *')
  async processPendingVideoAnalyses() {
    this.logger.log('Running scheduled task: processPendingVideoAnalyses');
    await this.aiMatchingService.processPendingVideoAnalyses();
  }
}
