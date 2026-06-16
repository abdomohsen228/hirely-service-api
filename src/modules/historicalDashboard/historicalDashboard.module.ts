import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { HistoricalDashboardController } from "./historicalDashboard.controller";
import { HistoricalDashboardService } from "./historicalDashboard.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  JobApplication,
  JobApplicationSchema,
} from 'src/database/schemas/application.schema';
import {
  Candidate,
  CandidateSchema,
} from 'src/database/schemas/candidate.schema';
import { Job, JobSchema } from 'src/database/schemas/jobs.schema';
import { Hr, HrSchema } from 'src/database/schemas/hr.schema';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import {
  UserJobScore,
  UserJobScoreSchema,
} from 'src/database/schemas/user_job_score.schema';


@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Job.name, schema: JobSchema },
      { name: Hr.name, schema: HrSchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobScore.name, schema: UserJobScoreSchema }
    ]),
  ],
  controllers: [HistoricalDashboardController],
  providers: [HistoricalDashboardService],
  exports: [HistoricalDashboardService],
})

export class HistoricalDashboardModule { }