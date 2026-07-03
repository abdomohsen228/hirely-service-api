import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { Model, Types } from 'mongoose';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';
import { CandidateInterviewStatus } from 'src/database/enums/candidateInterviewStatus.enum';
import { UserRole } from 'src/database/enums/userRole.enum';
import {
  JobApplication,
  JobApplicationDocument,
} from 'src/database/schemas/application.schema';
import {
  Candidate,
  CandidateDocument,
} from 'src/database/schemas/candidate.schema';
import {
  CandidateInterview,
  CandidateInterviewDocument,
} from 'src/database/schemas/candidate_interview.schema';
import {
  InterviewQuestion,
  InterviewQuestionDocument,
} from 'src/database/schemas/interview_questions.schema';
import {
  InterviewResponse,
  InterviewResponseDocument,
} from 'src/database/schemas/interview_responses.schema';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import { UserDocument } from 'src/database/schemas/user.schema';
import { S3Service } from 'src/s3/s3.service';
import { InterviewSumResponseDto } from './dto/response/interviewSumResponse.dto';
import { VideoAiAnalysis, VideoAiAnalysisDocument } from 'src/database/schemas/video_ai_analysis.schema';
import { InterviewResponsesSectionDto } from './dto/response/interviewResponsesSection.dto';
import { UploadService } from 'src/upload/upload.service';

@Injectable()
export class InterviewSumService {
  constructor(
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(VideoAiAnalysis.name)
    private readonly videoAiAnalysisModel: Model<VideoAiAnalysisDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(InterviewQuestion.name)
    private readonly interviewQuestionModel: Model<InterviewQuestionDocument>,
    @InjectModel(CandidateInterview.name)
    private readonly candidateInterviewModel: Model<CandidateInterviewDocument>,
    @InjectModel(InterviewResponse.name)
    private readonly interviewResponseModel: Model<InterviewResponseDocument>,
    private readonly uploadService: UploadService,
  ) {}

  private assertCandidateUser(user: UserDocument): void {
    if (user.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException('Only candidates can access interviews');
    }
  }

  public async getInterviewSum(
    user: UserDocument,
    applicationId: string,
  ): Promise<InterviewSumResponseDto> {
    this.assertCandidateUser(user);
    // preperations
    const application = await this.jobApplicationModel.findById(new Types.ObjectId(applicationId));
    if(!application.interviewed)
        throw new BadRequestException('Interview not completed yet for this application');
    const interviewAnalysis = await this.videoAiAnalysisModel.findOne({ applicationId });
    if(!interviewAnalysis)
        throw new BadRequestException('Interview not analysed yet for this application');
    const candidateInterview = await this.candidateInterviewModel.findOne({ applicationId: new Types.ObjectId(applicationId) });
    if(!candidateInterview)
        throw new BadRequestException('Candidate interview not found for this application');
    const interviewResponse = await this.interviewResponseModel.findOne({ candidateInterviewId: candidateInterview._id });
    const interviewQuestions = await this.interviewQuestionModel.find({ jobId: new Types.ObjectId(application.jobId) });
    const job = await this.jobModel.findById(new Types.ObjectId(application.jobId));

    // headers section
    const heaeders = {
        title: job.title,
        interviewDate: candidateInterview.started_at,
        interviewDuration: candidateInterview.submitted_at ? (candidateInterview.submitted_at.getTime() - candidateInterview.started_at.getTime()) / 1000 : null,
    }

    // performance
    const performance = {
        overall_performance: interviewAnalysis.overallInterviewScore,
        conclusion: interviewAnalysis.conclusion
    }

    // core competencies
    let communication_skills = 0;
    let confidence_level = 0;
    let answer_clarity = 0;
    const total_questions = interviewQuestions.length;
    for ( const video of interviewAnalysis.videos ) {
        communication_skills += video.audio.speech_score;
        confidence_level += video.body_language.scores.confidence_score;
        answer_clarity += video.audio.english_level_score;
    }
    confidence_level = (confidence_level / total_questions) * 100;
    communication_skills = (communication_skills / total_questions) * 100;
    answer_clarity = (answer_clarity / total_questions) * 100;
    const coreCompetencies = {
        communication_skills,
        confidence_level,
        answer_clarity
    };

    // interview
    const interviewResponses: InterviewResponsesSectionDto[] = [];
    for(const video of interviewAnalysis.videos) {
        const interviewResponse = await this.interviewResponseModel.findOne({ candidateInterviewId: candidateInterview._id, response: video.videoS3Key });
        const questionBody = await this.interviewQuestionModel.findById(interviewResponse.questionId);
        const videoUrl =  await this.uploadService.getVideoUrlByKey(video.videoS3Key);
        interviewResponses.push({
            question: questionBody.question,
            transcription: interviewResponse.transcription,
            order: questionBody.order,
            responseURL: videoUrl,
            responseDuration: String(interviewResponse.responseDuration),
            responseCount: total_questions
        });
    }

    return {
        id: applicationId,
        headerSection: heaeders,
        performanceSection: performance,
        coreCompetenciesSection: coreCompetencies,
        InterviewResponsesSection: interviewResponses
    }
  }

  
}
