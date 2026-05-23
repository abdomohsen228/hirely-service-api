import { ForbiddenException, Injectable } from '@nestjs/common';
import { User,UserDocument } from 'src/database/schemas/user.schema';
import { UserRole } from 'src/database/enums/userRole.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JobApplication,JobApplicationDocument } from 'src/database/schemas/application.schema';

@Injectable()
export class JobDashboardService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('JobApplication') private readonly jobApplicationModel: Model<JobApplicationDocument>
  ) {}

  private assertHrUser(user: UserDocument): void {
    if (user.role !== UserRole.HR) {
        throw new ForbiddenException('Only HR users can manage job posts');
    }
  }

  public async getJobDashboard(jobId: string, userPayload: UserDocument) {
    this.assertHrUser(userPayload);
  }
}