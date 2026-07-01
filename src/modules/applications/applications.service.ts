import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  JobApplication,
  JobApplicationDocument,
} from 'src/database/schemas/application.schema';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';
import { MyApplicationsStatsResponseDto } from '../applications/dtos/response/myApplicationsStatsResponse.dto';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common/exceptions';
import { UserRole } from 'src/database/enums/userRole.enum';
import {
  Candidate,
  CandidateDocument,
} from 'src/database/schemas/candidate.schema';
import { Hr, HrDocument } from 'src/database/schemas/hr.schema';
import { MyJobApplicationItemResponseDto } from '../job/dtos/response/myJobApplicationItemResponse.dto';
import { PaginatedMyJobApplicationsResponseDto } from '../job/dtos/response/paginatedMyJobApplicationsResponse.dto';
import { ListMyApplicationsQueryDto } from '../job/dtos/request/listMyApplicationsQuery.dto';
import { JobApplicationResponseDto } from '../job/dtos/response/jobApplicationResponse.dto';
import { JobPostResponseDto } from '../job/dtos/response/jobPostResponse.dto';
import { JobStatus } from 'src/database/enums/jobStatus.enum';

@Injectable()
export class ApplicationsService {
  private readonly defaultApplicationTotalStages = 4;
  constructor(
    @InjectModel(JobApplication.name)
    private jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Hr.name) private readonly hrModel: Model<HrDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

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

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
            id: doc._id.toString(),
            title: doc.title,
            department: doc.department,
            jobType: doc.jobType,
            location: doc.location,
            experienceLevel: doc.experienceLevel,
            roleContext: doc.roleContext,
            coreResponsibilities: doc.coreResponsibilities,
            companySummary: hrProfile?.companySummary ?? null,
            companySize: hrProfile?.companySize ?? null,
            hrName: hrProfile?.fullName ?? null,
            skills: doc.skills ?? [],
            keywords: doc.keywords ?? [],
            isCandidateApply: isCandidateApply ?? false,
            interviewerQuestions: questions,
            documentAttachment: doc.documentAttachment,
            companyName: doc.companyName,
            createdBy: doc.createdBy.toString(),
            status: doc.status,
            startDate: doc.startDate,
            endDate: doc.endDate,
            workplaceType: doc.workplaceType,
            sprintDuration: doc.sprintDuration,
            applicationCount: doc.applicationCount,
            createdAt: doc.get('createdAt'),
            updatedAt: doc.get('updatedAt'),
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

  private toResponse(
    doc: JobDocument,
    hrProfile?: HrDocument | null,
    isCandidateApply?: boolean,
  ): JobPostResponseDto {
    let questions: string[] = [];
    if (doc.interviewerQuestions && doc.interviewerQuestions.length > 0) {
      questions = doc.interviewerQuestions.map((q) => q.toString());
    }
    return {
      id: doc._id.toString(),
      title: doc.title,
      department: doc.department,
      jobType: doc.jobType,
      location: doc.location,
      experienceLevel: doc.experienceLevel,
      roleContext: doc.roleContext,
      coreResponsibilities: doc.coreResponsibilities,
      companySummary: hrProfile?.companySummary ?? null,
      companySize: hrProfile?.companySize ?? null,
      workplaceType: doc.workplaceType ?? null,
      hrName: hrProfile?.fullName ?? null,
      skills: doc.skills ?? [],
      keywords: doc.keywords ?? [],
      isCandidateApply: isCandidateApply ?? false,
      interviewerQuestions: questions,
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

  // move applications from APPLIED to cv screening phase
  public async updateApplicationStatuses(): Promise<void> {
    const updatedJobs = await this.jobModel
      .find({
        status: JobStatus.CLOSED,
        interviewStartDate: { $gt: new Date() },
      })
      .exec();
    for (const job of updatedJobs) {
      await this.jobApplicationModel.updateMany(
        { jobId: job._id, status: ApplicationStatus.APPLIED },
        {
          $set: {
            status: ApplicationStatus.IN_REVIEW,
            currentStage: 2,
            progressPercent: this.computeProgressPercent(
              2,
              this.defaultApplicationTotalStages,
            ),
            nextStepTitle: 'In review',
          },
        },
      );
    }
  }

  async moveApplicationsTointerview(): Promise<void> {
    const updatedJobs = await this.jobModel
      .find({
        interviewStatus: true,
      })
      .exec();
    for (const job of updatedJobs) {
      await this.jobApplicationModel.updateMany(
        { jobId: job._id, status: ApplicationStatus.IN_REVIEW },
        {
          $set: {
            status: ApplicationStatus.INTERVIEW,
            currentStage: 3,
            progressPercent: this.computeProgressPercent(
              3,
              this.defaultApplicationTotalStages,
            ),
            nextStepTitle: 'Interview phase',
          },
        },
      );
    }
  }

  public async rejectOverDueInterviews() {
    const updatedJobs = await this.jobModel
      .find({
        interviewStatus: false,
        interviewEndDate: { $eq: new Date() },
      })
      .exec();

    for (const job of updatedJobs) {
      await this.jobApplicationModel.updateMany(
        {
          jobId: job._id,
          status: ApplicationStatus.INTERVIEW,
          interviewed: false,
        },
        {
          $set: {
            status: ApplicationStatus.REJECTED,
            currentStage: 4,
            progressPercent: this.computeProgressPercent(
              4,
              this.defaultApplicationTotalStages,
            ),
            nextStepTitle: 'Missed Interview',
          },
        },
      );
    }
  }
}
