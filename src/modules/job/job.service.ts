import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';
import { JobStatus } from 'src/database/enums/jobStatus.enum';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import { Hr, HrDocument } from 'src/database/schemas/hr.schema';
import { UserRole } from 'src/database/enums/userRole.enum';
import {
  JobApplication,
  JobApplicationDocument,
} from 'src/database/schemas/application.schema';
import {
  Candidate,
  CandidateDocument,
} from 'src/database/schemas/candidate.schema';
import { CreateJobPostRequestDto } from './dtos/request/createJobPostRequest.dto';
import { ListMyApplicationsQueryDto } from './dtos/request/listMyApplicationsQuery.dto';
import { ListJobPostsQueryDto } from './dtos/request/listJobPostsQuery.dto';
import { UpdateHrJobApplicationRequestDto } from './dtos/request/updateHrJobApplicationRequest.dto';
import { UpdateJobPostRequestDto } from './dtos/request/updateJobPostRequest.dto';
import { JobApplicationResponseDto } from './dtos/response/jobApplicationResponse.dto';
import { JobPostResponseDto } from './dtos/response/jobPostResponse.dto';
import { MyApplicationsStatsResponseDto } from './dtos/response/myApplicationsStatsResponse.dto';
import { MyJobApplicationItemResponseDto } from './dtos/response/myJobApplicationItemResponse.dto';
import { PaginatedJobListResponseDto } from './dtos/response/paginatedJobListResponse.dto';
import { PaginatedMyJobApplicationsResponseDto } from './dtos/response/paginatedMyJobApplicationsResponse.dto';
import {
  UserJobScore,
  UserJobScoreDocument,
} from 'src/database/schemas/user_job_score.schema';
import { RecommendedJobItemResponseDto } from './dtos/response/recommendedJobItemResponse.dto';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { AiMatchingService } from '../ai-matching/ai-matching.service';

@Injectable()
export class JobService {
  private readonly defaultApplicationTotalStages = 5;

  constructor(
    @InjectModel(JobApplication.name)
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Hr.name) private readonly hrModel: Model<HrDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserJobScore.name)
    private readonly userJobScoreModel: Model<UserJobScoreDocument>,
    private readonly aiMatchingService: AiMatchingService,
  ) { }

  private assertHrUser(user: UserDocument): void {
    if (user.role !== UserRole.HR) {
      throw new ForbiddenException('Only HR users can manage job posts');
    }
  }

  private assertCandidateUser(user: UserDocument): void {
    if (user.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException('Only candidates can apply to jobs');
    }
  }

  private parseJobObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job id');
    }
    return new Types.ObjectId(id);
  }

  private parseApplicationObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid application id');
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

      if (candidate) {
        if (candidate.user && !candidate.user.equals(user._id)) {
          throw new ForbiddenException(
            'This candidate profile is linked to another account',
          );
        }

        if (!candidate.user) {
          candidate.user = user._id;
          await candidate.save();
        }
      }
    }

    if (!candidate) {
      throw new NotFoundException(
        'Candidate profile not found. Complete registration first.',
      );
    }

    return candidate;
  }

  private async getHrProfileForUser(user: UserDocument): Promise<HrDocument> {
    const userDoc = await this.userModel.findById(user._id).exec();
    if (!userDoc?.email) {
      throw new ForbiddenException(
        'Complete HR registration before creating job posts',
      );
    }

    const emailLocalPart = userDoc.email.split('@')[0];
    const hrProfile = await this.hrModel
      .findOne({ username: emailLocalPart })
      .exec();
    if (!hrProfile) {
      throw new ForbiddenException(
        'Complete HR registration before creating job posts',
      );
    }

    return hrProfile;
  }

  public async createJobPost(
    user: UserDocument,
    dto: CreateJobPostRequestDto,
  ): Promise<JobPostResponseDto> {
    this.assertHrUser(user);
    const hrProfile = await this.getHrProfileForUser(user);

    if (dto.compensationMax < dto.compensationMin) {
      throw new BadRequestException(
        'compensationMax must be greater than or equal to compensationMin',
      );
    }

    const created = await this.jobModel.create({
      title: dto.title,
      department: dto.department,
      jobType: dto.jobType,
      location: dto.location,
      experienceLevel: dto.experienceLevel,
      compensationMin: dto.compensationMin,
      compensationMax: dto.compensationMax,
      roleContext: dto.roleContext,
      coreResponsibilities: dto.coreResponsibilities,
      skills: dto.skills,
      keywords: dto.keywords,
      interviewerQuestions: dto.interviewerQuestions ?? [],
      documentAttachment: dto.documentAttachment,
      companyName: hrProfile.companyName,
      hr: hrProfile._id,
      createdBy: user._id,
      startDate: dto.startDate,
      endDate: dto.endDate,
      sprintDuration: dto.sprintDuration,
    });

    // Trigger AI matching for all candidates
    this.aiMatchingService.computeScoresForJob(created).catch((err) => {
      console.error('AI matching failed for new job:', err);
    });

    return this.toResponse(created, hrProfile);
  }

  public async listJobPosts(
    user: UserDocument,
    query: ListJobPostsQueryDto,
  ): Promise<PaginatedJobListResponseDto> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    let filter: Record<string, unknown> = {};

    let candidateId: Types.ObjectId | null = null;

    if (user.role === UserRole.HR) {
      filter = { createdBy: user._id };
    } else if (user.role === UserRole.CANDIDATE) {
      const candidate = await this.getCandidateForUser(user);
      candidateId = candidate._id;
      filter = { status: JobStatus.OPEN };
    } else {
      throw new ForbiddenException('Only HR and candidates can access jobs');
    }

    const [docs, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobModel.countDocuments(filter).exec(),
    ]);

    // Fetch all applications for this candidate in one query
    let appliedJobIds = new Set<string>();
    if (candidateId) {
      const jobIds = docs.map((d) => d._id);
      const applications = await this.jobApplicationModel
        .find({ jobId: { $in: jobIds }, candidateId })
        .select('jobId')
        .exec();
      appliedJobIds = new Set(applications.map((a) => a.jobId.toString()));
    }

    return {
      items: docs.map((d) =>
        this.toResponse(d, null, appliedJobIds.has(d._id.toString())),
      ),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  public async getRecommendedJobs(
    user: UserDocument,
  ): Promise<RecommendedJobItemResponseDto[]> {
    const candidate = await this.getCandidateForUser(user);

    const scores = await this.userJobScoreModel
      .find({ candidateId: candidate._id })
      .sort({ score: -1 })
      .limit(10) // Top 10 for homepage
      .exec();

    if (scores.length === 0) {
      return [];
    }

    const jobIds = scores.map((s) => s.jobId);
    const jobs = await this.jobModel.find({ _id: { $in: jobIds } }).exec();
    const jobsById = new Map(jobs.map((j) => [j._id.toString(), j]));

    const items: RecommendedJobItemResponseDto[] = [];
    for (const scoreDoc of scores) {
      const job = jobsById.get(scoreDoc.jobId.toString());
      if (job && job.status === JobStatus.OPEN) {
        items.push({
          job: this.toResponse(job),
          score: scoreDoc.score,
          matchedSkills: scoreDoc.matchedSkills,
        });
      }
    }

    return items;
  }

  public async getRecentJobs(): Promise<JobPostResponseDto[]> {
    const jobs = await this.jobModel
      .find({ status: JobStatus.OPEN })
      .sort({ createdAt: -1 })
      .limit(5)
      .exec();

    return jobs.map((job) => this.toResponse(job));
  }

  public async getJobPostById(
    user: UserDocument,
    id: string,
  ): Promise<JobPostResponseDto> {
    const jobId = this.parseJobObjectId(id);
    let filter: Record<string, unknown> = { _id: jobId };

    let isCandidateApply = false;
    if (user.role === UserRole.HR) {
      filter = { ...filter, createdBy: user._id };
    } else if (user.role === UserRole.CANDIDATE) {
      const candidate = await this.getCandidateForUser(user);
      const application = await this.jobApplicationModel
        .findOne({ jobId, candidateId: candidate._id })
        .exec();
      isCandidateApply = Boolean(application);
      filter = { ...filter, status: JobStatus.OPEN };
    } else {
      throw new ForbiddenException('Only HR and candidates can access jobs');
    }

    const doc = await this.jobModel.findOne(filter).exec();
    if (!doc) {
      throw new NotFoundException('Job not found');
    }
    const hrProfile = doc.hr
      ? await this.hrModel.findById(doc.hr).exec()
      : null;
    return this.toResponse(doc, hrProfile, isCandidateApply);
  }

  public async listMyApplications(
    user: UserDocument,
    query: ListMyApplicationsQueryDto,
  ): Promise<PaginatedMyJobApplicationsResponseDto> {
    const candidate = await this.getCandidateForUser(user);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = { candidateId: candidate._id };
    if (query.status) {
      filter.status = query.status;
    }

    const [applications, total] = await Promise.all([
      this.jobApplicationModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobApplicationModel.countDocuments(filter).exec(),
    ]);

    const uniqueJobIds = Array.from(
      new Set(applications.map((application) => application.jobId.toString())),
    ).map((value) => new Types.ObjectId(value));

    const jobs = await this.jobModel
      .find({ _id: { $in: uniqueJobIds } })
      .exec();
    const jobsById = new Map(jobs.map((job) => [job._id.toString(), job]));

    const items: MyJobApplicationItemResponseDto[] = applications.map(
      (application) => {
        const matchedJob = jobsById.get(application.jobId.toString());
        return {
          application: this.toApplicationResponse(application),
          job: matchedJob ? this.toResponse(matchedJob) : null,
        };
      },
    );

    return {
      items,
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  public async getMyApplicationStats(
    user: UserDocument,
  ): Promise<MyApplicationsStatsResponseDto> {
    const candidate = await this.getCandidateForUser(user);
    const candidateId = candidate._id;

    const [totalApplied, upcomingInterviews, bestDoc] = await Promise.all([
      this.jobApplicationModel.countDocuments({ candidateId }).exec(),
      this.jobApplicationModel
        .countDocuments({
          candidateId,
          status: ApplicationStatus.INTERVIEW,
          nextStepAt: { $gt: new Date() },
        })
        .exec(),
      this.jobApplicationModel
        .findOne({ candidateId, matchScore: { $ne: null, $exists: true } })
        .sort({ matchScore: -1 })
        .select('matchScore')
        .lean()
        .exec(),
    ]);

    const bestMatchScore =
      bestDoc && typeof bestDoc.matchScore === 'number'
        ? bestDoc.matchScore
        : null;

    let matchScoreHeadline: string | null = null;
    if (bestMatchScore != null) {
      if (bestMatchScore >= 95) {
        matchScoreHeadline = 'Top 5% Candidate';
      } else if (bestMatchScore >= 90) {
        matchScoreHeadline = 'Top 10% Candidate';
      }
    }

    return {
      totalApplied,
      upcomingInterviews,
      bestMatchScore,
      matchScoreHeadline,
    };
  }

  public async getMyApplicationById(
    user: UserDocument,
    applicationId: string,
  ): Promise<MyJobApplicationItemResponseDto> {
    const candidate = await this.getCandidateForUser(user);
    const appObjectId = this.parseApplicationObjectId(applicationId);

    const application = await this.jobApplicationModel
      .findOne({ _id: appObjectId, candidateId: candidate._id })
      .exec();
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    const job = await this.jobModel.findById(application.jobId).exec();
    return {
      application: this.toApplicationResponse(application),
      job: job ? this.toResponse(job) : null,
    };
  }

  public async applyToJob(
    user: UserDocument,
    id: string,
  ): Promise<MyJobApplicationItemResponseDto> {
    const jobId = this.parseJobObjectId(id);
    const candidate = await this.getCandidateForUser(user);

    const job = await this.jobModel.findById(jobId).exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== JobStatus.OPEN) {
      throw new BadRequestException('This job is not open for applications');
    }

    const existingApplication = await this.jobApplicationModel
      .findOne({ jobId, candidateId: candidate._id })
      .exec();
    if (existingApplication) {
      throw new BadRequestException('You have already applied to this job');
    }

    const resumeUrl = candidate.cvFileUrl || user.cvUrl;
    if (!resumeUrl) {
      throw new BadRequestException(
        'Upload your resume before applying to a job',
      );
    }

    const application = await this.jobApplicationModel.create({
      candidateId: candidate._id,
      jobId: job._id,
      resumeUrl,
      status: ApplicationStatus.APPLIED,
      appliedAt: new Date(),
      currentStage: 1,
      totalStages: this.defaultApplicationTotalStages,
      nextStepTitle: 'Application submitted',
      nextStepAt: null,
    });

    await this.jobModel.updateOne({ _id: job._id }, { $inc: { applicationCount: 1 } }).exec();
    job.applicationCount += 1;

    return {
      application: this.toApplicationResponse(application),
      job: this.toResponse(job),
    };
  }

  public async updateHrJobApplication(
    user: UserDocument,
    jobId: string,
    applicationId: string,
    dto: UpdateHrJobApplicationRequestDto,
  ): Promise<MyJobApplicationItemResponseDto> {
    this.assertHrUser(user);
    const jId = this.parseJobObjectId(jobId);
    const aId = this.parseApplicationObjectId(applicationId);

    const job = await this.jobModel
      .findOne({ _id: jId, createdBy: user._id })
      .exec();
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    const application = await this.jobApplicationModel
      .findOne({ _id: aId, jobId: jId })
      .exec();
    if (!application) {
      throw new NotFoundException('Application not found');
    }

    if (dto.status !== undefined) {
      application.status = dto.status;
    }
    if (dto.currentStage !== undefined) {
      application.currentStage = dto.currentStage;
    }
    if (dto.totalStages !== undefined) {
      application.totalStages = dto.totalStages;
    }
    if (dto.nextStepTitle !== undefined) {
      application.nextStepTitle =
        dto.nextStepTitle === null ? undefined : dto.nextStepTitle;
    }
    if (dto.nextStepAt !== undefined) {
      application.nextStepAt = dto.nextStepAt ? new Date(dto.nextStepAt) : null;
    }
    if (dto.matchScore !== undefined) {
      application.matchScore =
        dto.matchScore === null ? undefined : dto.matchScore;
    }
    if (dto.feedbackSummary !== undefined) {
      application.feedbackSummary =
        dto.feedbackSummary === null ? undefined : dto.feedbackSummary;
    }

    const totalStages =
      application.totalStages ?? this.defaultApplicationTotalStages;
    const currentStage = application.currentStage ?? 1;
    if (currentStage > totalStages) {
      throw new BadRequestException('currentStage cannot exceed totalStages');
    }

    await application.save();

    return {
      application: this.toApplicationResponse(application),
      job: this.toResponse(job),
    };
  }

  public async updateJobPost(
    user: UserDocument,
    id: string,
    dto: UpdateJobPostRequestDto,
  ): Promise<JobPostResponseDto> {
    this.assertHrUser(user);
    const jobId = this.parseJobObjectId(id);
    const doc = await this.jobModel
      .findOne({ _id: jobId, createdBy: user._id })
      .exec();
    if (!doc) {
      throw new NotFoundException('Job not found');
    }

    const nextMin = dto.compensationMin ?? doc.compensationMin;
    const nextMax = dto.compensationMax ?? doc.compensationMax;
    if (nextMax < nextMin) {
      throw new BadRequestException(
        'compensationMax must be greater than or equal to compensationMin',
      );
    }

    const assignableKeys: (keyof UpdateJobPostRequestDto)[] = [
      'title',
      'department',
      'jobType',
      'location',
      'experienceLevel',
      'compensationMin',
      'compensationMax',
      'roleContext',
      'coreResponsibilities',
      'skills',
      'keywords',
      'interviewerQuestions',
      'documentAttachment',
    ];

    for (const key of assignableKeys) {
      const value = dto[key];
      if (value !== undefined) {
        (doc as unknown as Record<string, unknown>)[key] = value;
      }
    }

    if (!doc.hr) {
      const hrProfile = await this.getHrProfileForUser(user);
      doc.hr = hrProfile._id;
    }

    await doc.save();
    return this.toResponse(doc);
  }

  public async deleteJobPost(user: UserDocument, id: string): Promise<void> {
    this.assertHrUser(user);
    const jobId = this.parseJobObjectId(id);
    const result = await this.jobModel
      .deleteOne({ _id: jobId, createdBy: user._id })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Job not found');
    }
  }

  private toResponse(
    doc: JobDocument,
    hrProfile?: HrDocument | null,
    isCandidateApply?: boolean,
  ): JobPostResponseDto {
    return {
      id: doc._id.toString(),
      title: doc.title,
      department: doc.department,
      jobType: doc.jobType,
      location: doc.location,
      experienceLevel: doc.experienceLevel,
      compensationMin: doc.compensationMin,
      compensationMax: doc.compensationMax,
      roleContext: doc.roleContext,
      coreResponsibilities: doc.coreResponsibilities,
      companySummary: hrProfile?.companySummary ?? null,
      companySize: hrProfile?.companySize ?? null,
      hrName: hrProfile?.fullName ?? null,
      skills: doc.skills ?? [],
      keywords: doc.keywords ?? [],
      isCandidateApply: isCandidateApply ?? false,
      interviewerQuestions: doc.interviewerQuestions ?? [],
      documentAttachment: doc.documentAttachment,
      companyName: doc.companyName,
      createdBy: doc.createdBy.toString(),
      status: doc.status,
      startDate: doc.startDate,
      endDate: doc.endDate,
      sprintDuration: doc.sprintDuration,
      applicationCount: doc.applicationCount,
      createdAt: doc.get('createdAt'),
      updatedAt: doc.get('updatedAt'),
    };
  }

  private computeProgressPercent(
    currentStage: number,
    totalStages: number,
  ): number {
    const total =
      totalStages > 0 ? totalStages : this.defaultApplicationTotalStages;
    const current = Math.min(Math.max(currentStage, 1), total);
    return Math.min(100, Math.round((current / total) * 100));
  }

  private toApplicationResponse(
    doc: JobApplicationDocument,
  ): JobApplicationResponseDto {
    const totalStages = doc.totalStages ?? this.defaultApplicationTotalStages;
    const currentStage = doc.currentStage ?? 1;

    return {
      id: doc._id.toString(),
      jobId: doc.jobId.toString(),
      candidateId: doc.candidateId.toString(),
      resumeUrl: doc.resumeUrl,
      status: doc.status,
      appliedAt: doc.appliedAt ?? doc.get('createdAt'),
      currentStage,
      totalStages,
      progressPercent: this.computeProgressPercent(currentStage, totalStages),
      nextStepTitle: doc.nextStepTitle ?? null,
      nextStepAt: doc.nextStepAt ?? null,
      matchScore:
        doc.matchScore === undefined || doc.matchScore === null
          ? null
          : doc.matchScore,
      feedbackSummary: doc.feedbackSummary ?? null,
      createdAt: doc.get('createdAt'),
      updatedAt: doc.get('updatedAt'),
    };
  }
}
