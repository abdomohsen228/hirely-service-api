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
import { UploadService } from 'src/upload/upload.service';
import { CandidateInterviewDocument, CandidateInterview } from 'src/database/schemas/candidate_interview.schema';
import { CandidateInterviewStatus } from 'src/database/enums/candidateInterviewStatus.enum';
import { InterviewSprintDocument, InterviewSprint } from 'src/database/schemas/interview_sprint.schema';
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
    @InjectModel(CandidateInterview.name) private readonly candidateInterviewModel: Model<CandidateInterviewDocument>,
    @InjectModel(InterviewSprint.name) private readonly interviewSprintModel: Model<InterviewSprintDocument>,

    private readonly uploadService: UploadService,
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
    const cvUrls = await Promise.all(
      applications.map((application) =>
        this.uploadService.getCvUrlByKey(application.resumeUrl),
      ),
    );
    const items: MyJobApplicationItemResponseDto[] = applications.map(
      (application) => {
        const matchedJob = jobsById.get(application.jobId.toString());
        const cv = cvUrls[applications.indexOf(application)];
        return {
          application: this.toApplicationResponse(application, cv),
          job: matchedJob ? this.toResponse(matchedJob) : null,
            // id: doc._id.toString(),
            // title: doc.title,
            // department: doc.department,
            // jobType: doc.jobType,
            // location: doc.location,
            // experienceLevel: doc.experienceLevel,
            // roleContext: doc.roleContext,
            // coreResponsibilities: doc.coreResponsibilities,
            // companySummary: hrProfile?.companySummary ?? null,
            // companySize: hrProfile?.companySize ?? null,
            // hrName: hrProfile?.fullName ?? null,
            // skills: doc.skills ?? [],
            // keywords: doc.keywords ?? [],
            // isCandidateApply: isCandidateApply ?? false,
            // interviewerQuestions: questions,
            // documentAttachment: doc.documentAttachment,
            // companyName: doc.companyName,
            // createdBy: doc.createdBy.toString(),
            // status: doc.status,
            // startDate: doc.startDate,
            // endDate: doc.endDate,
            // workplaceType: doc.workplaceType,
            // sprintDuration: doc.sprintDuration,
            // applicationCount: doc.applicationCount,
            // createdAt: doc.get('createdAt'),
            // updatedAt: doc.get('updatedAt'),
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
    const cv = await this.uploadService.getCvUrlByKey(application.resumeUrl);
    return {
      application: this.toApplicationResponse(application,cv),
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
    cv: string
  ): JobApplicationResponseDto {
    const totalStages = doc.totalStages ?? this.defaultApplicationTotalStages;
    const currentStage = doc.currentStage ?? 1;

    return {
      id: doc._id.toString(),
      jobId: doc.jobId.toString(),
      candidateId: doc.candidateId.toString(),
      resumeUrl: cv,
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
  // public async updateApplicationStatuses(): Promise<void> {
  //   const updatedJobs = await this.jobModel
  //     .find({
  //       status: JobStatus.CLOSED,
  //       interviewStartDate: { $gt: new Date() },
  //     })
  //     .exec();
  //   for (const job of updatedJobs) {
  //     await this.jobApplicationModel.updateMany(
  //       { jobId: job._id, status: ApplicationStatus.APPLIED },
  //       {
  //         $set: {
  //           status: ApplicationStatus.IN_REVIEW,
  //           currentStage: 2,
  //           progressPercent: this.computeProgressPercent(
  //             2,
  //             this.defaultApplicationTotalStages,
  //           ),
  //           nextStepTitle: 'CV filtering',
  //         },
  //       },
  //     );
  //   }
  // }

  public async updateInReviewApplications():Promise<void>{
    const applications = await this.jobApplicationModel
      .find({
        status: ApplicationStatus.IN_REVIEW,
      })
      .exec();
    for(const app of applications){
      if(app.matchScore > 0.5){
        const job = await this.jobModel.findOne({_id: app.jobId});

        await this.jobApplicationModel.updateMany(
          {_id: app._id},
          {
            $set:{
              status: ApplicationStatus.SHORTLISTED,
              stage: 2,
              nextStepAt: job.interviewStartDate,
              nextStepTitle: "schedule Interview"
            }
          }
        )
      }
      else{
        await this.jobApplicationModel.updateMany(
          {_id: app._id},
          {
            $set:{
              status: ApplicationStatus.CV_FAILED,
              stage: 3,
              nextStepAt: null,
              nextStepTitle: "Waitng Final Decision"
            }
          }
        )
      }
    }
  } 

  public async updateShortlistedApplications(): Promise<void> {
    const now = new Date();

    // get shortlisted apps
    const applications = await this.jobApplicationModel.find({
      status: ApplicationStatus.SHORTLISTED,
    });

    for (const application of applications) {
      const job = await this.jobModel.findById(application.jobId);

      if (!job) {
        continue;
      }

      // if job interviewstart date hasn't started yet continue
      if (!this.shouldMoveToInterview(job, now)) {
        continue;
      }

      // update applications
      await this.moveApplicationToInterview(application, job);

      // update the interview objects
      const sprint = await this.getOrCreateInterviewSprint(job);

      await this.getOrCreateCandidateInterview(
        application,
        job,
        sprint,
      );
    }
  }

  private shouldMoveToInterview(job: JobDocument, now: Date): boolean {
    return (
      job.status === JobStatus.CLOSED &&
      job.interviewStartDate <= now &&
      job.interviewEndDate > now
    );
  }

  private async moveApplicationToInterview(
    application: JobApplicationDocument,
    job: JobDocument,
  ): Promise<void> {

    application.status = ApplicationStatus.INTERVIEW;
    application.currentStage = 3;
    application.nextStepTitle = 'AI interview evaluation';
    application.nextStepAt = job.interviewEndDate;

    await application.save();
  }

  private async getOrCreateInterviewSprint(
    job: JobDocument,
  ): Promise<InterviewSprintDocument> {

    let sprint = await this.interviewSprintModel.findOne({
      jobId: job._id,
    });

    if (sprint) {
      return sprint;
    }

    sprint = await this.interviewSprintModel.create({
      jobId: job._id,
      title: job.title,
      start_date: job.interviewStartDate,
      end_date: job.interviewEndDate,
      createdBy: job.hr,
    });

    return sprint;
  }

  private async getOrCreateCandidateInterview(
    application: JobApplicationDocument,
    job: JobDocument,
    sprint: InterviewSprintDocument,
  ): Promise<void> {

    let interview = await this.candidateInterviewModel.findOne({
      applicationId: application._id,
    });

    if (!interview) {
      await this.candidateInterviewModel.create({
        applicationId: application._id,
        jobId: job._id,
        sprintId: sprint._id,
        status: CandidateInterviewStatus.INVITED,
        started_at: null,
        submitted_at: null,
      });

      return;
    }

    interview.sprintId = sprint._id;
    interview.status = CandidateInterviewStatus.INVITED;

    await interview.save();
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

  // public async rejectOverDueInterviews() {
  //   const updatedJobs = await this.jobModel
  //     .find({
  //       interviewStatus: false,
  //       interviewEndDate: { $eq: new Date() },
  //     })
  //     .exec();

  //   for (const job of updatedJobs) {
  //     await this.jobApplicationModel.updateMany(
  //       {
  //         jobId: job._id,
  //         status: ApplicationStatus.INTERVIEW,
  //         interviewed: false,
  //       },
  //       {
  //         $set: {
  //           status: ApplicationStatus.REJECTED,
  //           currentStage: 4,
  //           progressPercent: this.computeProgressPercent(
  //             4,
  //             this.defaultApplicationTotalStages,
  //           ),
  //           nextStepTitle: 'Missed Interview',
  //         },
  //       },
  //     );
  //   }
  // }
}
