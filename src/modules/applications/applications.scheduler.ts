import {Injectable, Logger} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {ApplicationsService} from './applications.service';

@Injectable()
export class ApplicationsScheduler {
  private readonly logger = new Logger(ApplicationsScheduler.name);
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Cron('0 0 * * *')
  async updateApplicationStatuses() {
    this.logger.log('Running scheduled task: updateApplicationStatuses');
    await this.applicationsService.updateApplicationStatuses();
  }

  @Cron('0 0 * * *')
  async moveApplicationsTointerview(){
    this.logger.log('Running scheduled task: moveApplicationsTointerview');
    await this.applicationsService.moveApplicationsTointerview();
  }

  @Cron(`0 0 * * *`)
  async rejectOverDueInterviews(){
    this.logger.log('Runing scheduled task: rejectOverDueInterviews')
    await this.applicationsService.rejectOverDueInterviews();
  }
}
