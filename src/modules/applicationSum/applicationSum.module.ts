import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
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
import { AuthModule } from 'src/modules/auth/auth.module';
import { AiMatchingModule } from 'src/modules/ai-matching/ai-matching.module';
import { InterviewQuestion, InterviewQuestionSchema } from 'src/database/schemas/interview_questions.schema';
import { ApplicationSumController } from './applicationSum.controller';
import { ApplicationSumService } from './applicationSum.service';
import { VideoAiAnalysis, VideoAiAnalysisSchema } from 'src/database/schemas/video_ai_analysis.schema';
import { CandidateInterviewSchema,CandidateInterview } from 'src/database/schemas/candidate_interview.schema';
import { InterviewResponse,InterviewResponseSchema } from 'src/database/schemas/interview_responses.schema';
import { RecruiterNoteDocument,RecruiterNote, RecruiterNoteSchema } from 'src/database/schemas/recruiter_notes.schema';

@Module({
  imports: [
    AuthModule,
    AiMatchingModule,
    MongooseModule.forFeature([
      { name: JobApplication.name, schema: JobApplicationSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Job.name, schema: JobSchema },
      { name: Hr.name, schema: HrSchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobScore.name, schema: UserJobScoreSchema },
      { name: InterviewQuestion.name, schema: InterviewQuestionSchema },
      { name: VideoAiAnalysis.name, schema: VideoAiAnalysisSchema },
      { name: CandidateInterview.name, schema: CandidateInterviewSchema },
      { name: InterviewResponse.name, schema: InterviewResponseSchema },
      { name: RecruiterNote.name, schema: RecruiterNoteSchema },

    ]),
  ],
  controllers: [ApplicationSumController],
  providers: [ApplicationSumService],
  exports: [ApplicationSumService],
})
export class ApplicationSumModule {}
