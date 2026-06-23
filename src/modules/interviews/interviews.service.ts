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
import { CreateInterviewUploadUrlRequestDto } from './dtos/request/createInterviewUploadUrlRequest.dto';
import { SaveInterviewAnswerRequestDto } from './dtos/request/saveInterviewAnswerRequest.dto';
import { InterviewAnswerResponseDto } from './dtos/response/interviewAnswerResponse.dto';
import { InterviewSessionResponseDto } from './dtos/response/interviewSessionResponse.dto';
import { InterviewUploadUrlResponseDto } from './dtos/response/interviewUploadUrlResponse.dto';
import { InterviewInstructionsResponseDto } from './dtos/response/interviewInstructionsResponse.dto';
type InterviewContext = {
  candidate: CandidateDocument;
  application: JobApplicationDocument;
  job: JobDocument;
};

@Injectable()
export class InterviewsService {
  private readonly bucket = process.env.AWS_S3_BUCKET_NAME!;

  constructor(
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(InterviewQuestion.name)
    private readonly interviewQuestionModel: Model<InterviewQuestionDocument>,
    @InjectModel(CandidateInterview.name)
    private readonly candidateInterviewModel: Model<CandidateInterviewDocument>,
    @InjectModel(InterviewResponse.name)
    private readonly interviewResponseModel: Model<InterviewResponseDocument>,
    private readonly s3Service: S3Service,
  ) {}

  private assertCandidateUser(user: UserDocument): void {
    if (user.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException('Only candidates can access interviews');
    }
  }

  private parseObjectId(id: string, label: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException(`Invalid ${label} id`);
    }
    return new Types.ObjectId(id);
  }

  private async getCandidateForUser(
    user: UserDocument,
  ): Promise<CandidateDocument> {
    this.assertCandidateUser(user);

    let candidate = await this.candidateModel
      .findOne({ user: user._id })
      .exec();
    if (!candidate) {
      const legacyUsername = user.email.split('@')[0];
      candidate = await this.candidateModel
        .findOne({ username: legacyUsername })
        .exec();
    }

    if (!candidate) {
      throw new NotFoundException(
        'Candidate profile not found. Complete registration first.',
      );
    }

    return candidate;
  }

  private buildPracticeQuestion() {
    return {
      id: 'practice-question',
      order: 0,
      question:
        'Please introduce yourself briefly. This is a practice question to test your camera and microphone. Your response will not be saved or evaluated.',
      answerDuration: 60,
      preparationDuration: 45,
      type: 'practice' as const,
      requiresSubmission: false,
      isAnswered: false,
      answerVideoKey: null,
      responseDuration: null,
    };
  }
  private async getInterviewContext(
    user: UserDocument,
    applicationId: string,
  ): Promise<InterviewContext> {
    const candidate = await this.getCandidateForUser(user);
    const appObjectId = this.parseObjectId(applicationId, 'application');

    const application = await this.jobApplicationModel
      .findOne({ _id: appObjectId, candidateId: candidate._id })
      .exec();
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = await this.jobModel.findById(application.jobId).exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return { candidate, application, job };
  }

  private assertInterviewIsAvailable(
    application: JobApplicationDocument,
    job: JobDocument,
  ): void {
    if (application.status !== ApplicationStatus.INTERVIEW) {
      throw new ForbiddenException(
        'Interview is only available for applications in interview stage',
      );
    }

    const now = new Date();
    if (job.interviewStartDate && now < job.interviewStartDate) {
      throw new ForbiddenException('Interview phase has not started yet');
    }
    if (job.interviewEndDate && now > job.interviewEndDate) {
      throw new ForbiddenException('Interview phase has ended');
    }
  }

  private async getQuestionsForJob(
    job: JobDocument,
  ): Promise<InterviewQuestionDocument[]> {
    if (job.interviewerQuestions?.length) {
      const questions = await this.interviewQuestionModel
        .find({ _id: { $in: job.interviewerQuestions } })
        .exec();
      const questionsById = new Map(
        questions.map((question) => [question._id.toString(), question]),
      );
      return job.interviewerQuestions
        .map((questionId) => questionsById.get(questionId.toString()))
        .filter(Boolean) as InterviewQuestionDocument[];
    }

    return this.interviewQuestionModel
      .find({ jobId: job._id })
      .sort({ order: 1, createdAt: 1 })
      .exec();
  }

  private async getInterviewByIdForUser(
    user: UserDocument,
    interviewId: string,
  ): Promise<InterviewContext & { interview: CandidateInterviewDocument }> {
    const interviewObjectId = this.parseObjectId(interviewId, 'interview');
    const interview = await this.candidateInterviewModel
      .findById(interviewObjectId)
      .exec();
    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    const context = await this.getInterviewContext(
      user,
      interview.applicationId.toString(),
    );

    return { ...context, interview };
  }

  private async getInterviewResponses(
    interviewId: Types.ObjectId,
  ): Promise<Map<string, InterviewResponseDocument>> {
    const responses = await this.interviewResponseModel
      .find({ candidateInterviewId: interviewId })
      .exec();
    return new Map(
      responses.map((response) => [response.questionId.toString(), response]),
    );
  }

  private toAnswerResponse(
    response: InterviewResponseDocument,
  ): InterviewAnswerResponseDto {
    return {
      id: response._id.toString(),
      interviewId: response.candidateInterviewId.toString(),
      questionId: response.questionId.toString(),
      videoKey: response.response,
      transcription: response.transcription,
      responseDuration: response.responseDuration,
      createdAt: response.get('createdAt'),
      updatedAt: response.get('updatedAt'),
    };
  }

  private async toSessionResponse(
  context: InterviewContext,
  interview: CandidateInterviewDocument | null,
): Promise<InterviewSessionResponseDto> {
  const realQuestions = await this.getQuestionsForJob(context.job);
  const responsesByQuestionId = interview
    ? await this.getInterviewResponses(interview._id)
    : new Map<string, InterviewResponseDocument>();

  // only real questions count toward progress / submit
  const answeredCount = realQuestions.filter((question) =>
    responsesByQuestionId.has(question._id.toString()),
  ).length;

  const firstUnansweredIndex = realQuestions.findIndex(
    (question) => !responsesByQuestionId.has(question._id.toString()),
  );

  const status = interview?.status ?? CandidateInterviewStatus.INVITED;

  const practiceQuestion = this.buildPracticeQuestion();

  const mappedRealQuestions = realQuestions.map((question, index) => {
    const response = responsesByQuestionId.get(question._id.toString());

    return {
      id: question._id.toString(),
      order: index + 1,
      question: question.question,
      answerDuration: question.answerDuration,
      preparationDuration: 45,
      type: 'question' as const,
      requiresSubmission: true,
      isAnswered: Boolean(response),
      answerVideoKey: response?.response ?? null,
      responseDuration: response?.responseDuration ?? null,
    };
  });

  const questions = [practiceQuestion, ...mappedRealQuestions];

  // currentStep is for UI navigation:
  // 1 = practice question
  // 2 = first real unanswered question
  // 3 = second real unanswered question
  // ...
  const currentStep =
    firstUnansweredIndex === -1
      ? questions.length
      : firstUnansweredIndex + 2;

  return {
    interviewId: interview?._id.toString() ?? null,
    applicationId: context.application._id.toString(),
    jobId: context.job._id.toString(),
    status,
    currentStep,
    totalSteps: questions.length,
    answeredCount,
    canStart:
      status === CandidateInterviewStatus.INVITED &&
      context.application.status === ApplicationStatus.INTERVIEW,
    canSubmit:
      status === CandidateInterviewStatus.STARTED &&
      realQuestions.length > 0 &&
      answeredCount === realQuestions.length,
    interviewStartDate: context.job.interviewStartDate ?? null,
    interviewEndDate: context.job.interviewEndDate ?? null,
    questions,
  };
  }

  public async getInterviewInstructions(user:UserDocument):Promise<InterviewInstructionsResponseDto>{
    this.assertCandidateUser(user);
    const title = 'Interview Instructions';
    const instructions = [
      'Ensure your camera is ON',
      'Ensure your microphone is working and audio is clear',
      'Use a quiet environment',
      'You have 45 seconds as a preperation time before each question',
      'Each answer has a maximum duration of 60 seconds',
    ];
    return{
      title:title,
      instructions:instructions
    }

  }

  public async getApplicationInterview(
    user: UserDocument,
    applicationId: string,
  ): Promise<InterviewSessionResponseDto> {
    const context = await this.getInterviewContext(user, applicationId);
    this.assertInterviewIsAvailable(context.application, context.job);

    const interview = await this.candidateInterviewModel
      .findOne({ applicationId: context.application._id })
      .exec();

    return this.toSessionResponse(context, interview);
  }

  public async startApplicationInterview(
    user: UserDocument,
    applicationId: string,
  ): Promise<InterviewSessionResponseDto> {
    const context = await this.getInterviewContext(user, applicationId);
    this.assertInterviewIsAvailable(context.application, context.job);

    let interview = await this.candidateInterviewModel
      .findOne({ applicationId: context.application._id })
      .exec();

    if (!interview) {
      interview = await this.candidateInterviewModel.create({
        applicationId: context.application._id,
        jobId: context.job._id,
        status: CandidateInterviewStatus.STARTED,
        started_at: new Date(),
      });
    } else if (interview.status === CandidateInterviewStatus.INVITED) {
      interview.status = CandidateInterviewStatus.STARTED;
      interview.started_at = new Date();
      await interview.save();
    }

    return this.toSessionResponse(context, interview);
  }

  public async createQuestionUploadUrl(
    user: UserDocument,
    interviewId: string,
    questionId: string,
    dto: CreateInterviewUploadUrlRequestDto,
  ): Promise<InterviewUploadUrlResponseDto> {
    const { job, interview } = await this.getInterviewByIdForUser(
      user,
      interviewId,
    );
    if (interview.status !== CandidateInterviewStatus.STARTED) {
      throw new BadRequestException('Interview is not active');
    }
    if (questionId === 'practice-question') {
      throw new BadRequestException(
        'Practice question does not support uploads',
      );
    }

    const questionObjectId = this.parseObjectId(questionId, 'question');
    const questions = await this.getQuestionsForJob(job);
    const questionExists = questions.some((question) =>
      question._id.equals(questionObjectId),
    );
    if (!questionExists) {
      throw new NotFoundException('Question not found for this interview');
    }
    if (!dto.contentType.startsWith('video/')) {
      throw new BadRequestException('Only video uploads are supported');
    }

    const extension = path.extname(dto.fileName) || '.webm';
    const key = `interviews/answers/${user._id.toString()}/${interview._id.toString()}/${questionObjectId.toString()}/${randomUUID()}${extension}`;

    return this.s3Service.createUploadUrl({
      bucket: this.bucket,
      key,
      contentType: dto.contentType,
    });
  }

  public async saveAnswer(
    user: UserDocument,
    interviewId: string,
    dto: SaveInterviewAnswerRequestDto,
  ): Promise<InterviewAnswerResponseDto> {
    const { job, interview } = await this.getInterviewByIdForUser(
      user,
      interviewId,
    );
    if (interview.status !== CandidateInterviewStatus.STARTED) {
      throw new BadRequestException('Interview is not active');
    }

    if (dto.questionId === 'practice-question') {
      throw new BadRequestException(
        'Practice question responses are not saved',
      );
    }

    const questionObjectId = this.parseObjectId(dto.questionId, 'question');
    const questions = await this.getQuestionsForJob(job);
    const questionExists = questions.some((question) =>
      question._id.equals(questionObjectId),
    );
    if (!questionExists) {
      throw new NotFoundException('Question not found for this interview');
    }

    const response = await this.interviewResponseModel
      .findOneAndUpdate(
        {
          candidateInterviewId: interview._id,
          questionId: questionObjectId,
        },
        {
          candidateInterviewId: interview._id,
          questionId: questionObjectId,
          response: dto.videoKey,
          transcription: dto.transcription ?? '',
          responseDuration: dto.responseDuration,
        },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )
      .exec();

    return this.toAnswerResponse(response);
  }

  public async submitInterview(
    user: UserDocument,
    interviewId: string,
  ): Promise<InterviewSessionResponseDto> {
    const context = await this.getInterviewByIdForUser(user, interviewId);
    const { application, job, interview } = context;

    if (interview.status !== CandidateInterviewStatus.STARTED) {
      throw new BadRequestException('Only started interviews can be submitted');
    }

    const questions = await this.getQuestionsForJob(job);
    const responsesByQuestionId = await this.getInterviewResponses(
      interview._id,
    );
    if (
      questions.length === 0 ||
      responsesByQuestionId.size < questions.length
    ) {
      throw new BadRequestException(
        'Answer all interview questions before submitting',
      );
    }

    interview.status = CandidateInterviewStatus.SUBMITTED;
    interview.submitted_at = new Date();
    application.interviewed = true;
    await Promise.all([interview.save(), application.save()]);

    return this.toSessionResponse({ ...context, application }, interview);
  }
}
