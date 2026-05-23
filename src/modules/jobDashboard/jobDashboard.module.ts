
import { Module } from '@nestjs/common';
import { JobDashboardController } from './jobDashboard.controller';
import { JobDashboardService } from './jobDashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { JobApplication, JobApplicationSchema } from 'src/database/schemas/application.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
import { Job,JobSchema } from 'src/database/schemas/jobs.schema';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'JobApplication', schema: JobApplicationSchema },
      { name: 'Job', schema: JobSchema }
    ])
  ],
  controllers: [JobDashboardController],
  providers: [JobDashboardService],
})
export class JobDashboardModule {}