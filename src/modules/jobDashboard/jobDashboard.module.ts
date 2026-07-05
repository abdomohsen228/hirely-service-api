
import { Module } from '@nestjs/common';
import { JobDashboardController } from './jobDashboard.controller';
import { JobDashboardService } from './jobDashboard.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { JobApplication, JobApplicationSchema } from 'src/database/schemas/application.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
import { Job,JobSchema } from 'src/database/schemas/jobs.schema';
import { Candidate, CandidateSchema } from 'src/database/schemas/candidate.schema';
import { ExportModule } from '../export/export.module';
import { VideoAiAnalysisSchema, VideoAiAnalysis } from 'src/database/schemas/video_ai_analysis.schema';
import { CandidateInterviewSchema, CandidateInterview} from 'src/database/schemas/candidate_interview.schema';
import { InterviewSprint, InterviewSprintSchema } from 'src/database/schemas/interview_sprint.schema';
@Module({
  imports: [
    AuthModule,
    ExportModule,
    MongooseModule.forFeature([
      { name: 'User', schema: UserSchema },
      { name: 'JobApplication', schema: JobApplicationSchema },
      { name: 'Job', schema: JobSchema },
      { name: 'Candidate', schema: CandidateSchema },
      { name: 'VideoAiAnalysis', schema: VideoAiAnalysisSchema },
      { name: CandidateInterview.name, schema: CandidateInterviewSchema },
      { name: InterviewSprint.name, schema: InterviewSprintSchema },
    ])
  ],
  controllers: [JobDashboardController],
  providers: [JobDashboardService],
})
export class JobDashboardModule {}