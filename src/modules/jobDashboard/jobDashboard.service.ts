import { ForbiddenException, Injectable } from '@nestjs/common';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { UserRole } from 'src/database/enums/userRole.enum';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  JobApplication,
  JobApplicationDocument,
} from 'src/database/schemas/application.schema';
import { JobDashboardResponseDto } from './dtos/response/jobDashboardResponse.dto';
import { CandidateDocument } from 'src/database/schemas/candidate.schema';
import { CandidateDataDto } from './dtos/response/candidateData.dto';
import { DashboardDataDto } from './dtos/response/dashboardData.dto';
import { JobApplicationResponseDto } from './dtos/response/jobApplicationResponse.dto';
import { JobDashboardRequestDto } from './dtos/request/JobDashboardRequest.dto';
import { UpdateJobDashboardApplicationRequestDto } from './dtos/request/updateJobDashboardApplicationRequest.dto';
import { Response } from 'express';
import { jobDasboardExportRequestDto } from './dtos/request/jobDashboardExportRequest.dto';
import { Parser } from 'json2csv';
import * as ExcelJS from 'exceljs';
import * as PDFDocument from 'pdfkit';
import { ExportService } from '../export/export.service';
import { ApplicationSummaryResponseDto } from './dtos/response/applicationSummaryResponse.dto';
import { Types } from 'mongoose';
import { JobDocument } from 'src/database/schemas/jobs.schema';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';
import { VideoAiAnalysisDocument } from 'src/database/schemas/video_ai_analysis.schema';

@Injectable()
export class JobDashboardService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<UserDocument>,
    @InjectModel('JobApplication')
    private readonly jobApplicationModel: Model<JobApplicationDocument>,
    @InjectModel('Candidate')
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel('Job') private readonly jobModel: Model<JobDocument>,
    private readonly exportService: ExportService,
    @InjectModel('VideoAiAnalysis') private readonly videoAiAnalysisModel: Model<VideoAiAnalysisDocument>,
  ) {}

  private assertHrUser(user: UserDocument): void {
    if (user.role !== UserRole.HR) {
      throw new ForbiddenException('Only HR users can manage job posts');
    }
  }

  private async getJobApplicationCount(jobId: string): Promise<number> {
    return this.jobApplicationModel
      .countDocuments({ jobId: new Types.ObjectId(jobId) })
      .exec();
  }

  private async getJobApplicationCountToday(jobId: string): Promise<number> {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return this.jobApplicationModel
      .countDocuments({
        jobId: new Types.ObjectId(jobId),
        appliedAt: { $gte: startOfToday },
      })
      .exec();
  }

  private async getShortlistedCandidatesCount(jobId: string): Promise<number> {
    return this.jobApplicationModel
      .countDocuments({
        jobId: new Types.ObjectId(jobId),
        status: 'shortlisted',
      })
      .exec();
  }

  private async getAverageMatchScore(jobId: string): Promise<number> {
    const avgMatchScore = await this.jobApplicationModel
      .aggregate([
        { $match: { jobId: new Types.ObjectId(jobId) } },
        { $group: { _id: null, average: { $avg: '$matchScore' } } },
      ])
      .exec();
    return avgMatchScore.length > 0 ? avgMatchScore[0].average : 0;
  }

  private async getApplications(
    jobId: string,
    page: number,
    limit: number,
    applicationStatus?: string,
    matchScore?: number,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { jobId: new Types.ObjectId(jobId) };
    if (applicationStatus) {
      filter.status = applicationStatus;
    }
    if (matchScore !== undefined) {
      filter.matchScore = { $gte: matchScore };
    }

    let query = this.jobApplicationModel.find(filter).skip(skip).limit(limit);

    if (matchScore !== undefined) {
      query = query.sort({ matchScore: -1 });
    }

    return query.exec();
  }

  private async getFilteredApplicationsCount(
    jobId: string,
    applicationStatus?: string,
    matchScore?: number,
  ): Promise<number> {
    const filter: any = { jobId: new Types.ObjectId(jobId) };
    if (applicationStatus) {
      filter.status = applicationStatus;
    }
    if (matchScore !== undefined) {
      filter.matchScore = { $gte: matchScore };
    }
    return this.jobApplicationModel.countDocuments(filter).exec();
  }

  private async getCandidateInfo(candidateId: string) {
    return this.candidateModel.findById(candidateId).exec();
  }

  private async getCVRank(applicationId: string){

  }

  public async getJobDashboard(
    userPayload: UserDocument,
    jobId: string,
    query: JobDashboardRequestDto,
  ): Promise<JobDashboardResponseDto> {
    this.assertHrUser(userPayload);
    const { page = 1, limit = 10, applicationStatus, matchScore } = query;
    // get number of applications
    const totalApplications = await this.getJobApplicationCount(String(jobId));
    // get number of applications today
    const applicationsToday = await this.getJobApplicationCountToday(
      String(jobId),
    );
    // get number of shortlisted candidates
    const shortlistedCandidates = await this.getShortlistedCandidatesCount(
      String(jobId),
    );
    // get average match score
    const avgMatchScore = await this.getAverageMatchScore(String(jobId));
    // get dashboard data for each application status
    const applications = await this.getApplications(
      String(jobId),
      page,
      limit,
      applicationStatus,
      matchScore,
    );
    const totalFilteredApplications = await this.getFilteredApplicationsCount(
      String(jobId),
      applicationStatus,
      matchScore,
    );
    // const CVRank = await this.
    const dashboardData = [] as DashboardDataDto[];
    for (const application of applications) {
      const candidateInfo = await this.getCandidateInfo(
        String(application.candidateId),
      );
      dashboardData.push({
        applicationId: String(application._id),
        candidate: {
          candidateId: String(application.candidateId),
          name: candidateInfo.fullName,
          role: candidateInfo.currentJobTitle,
        },
        application: {
          applicationStatus: application.status,
        },
        match: {
          matchScore: application.matchScore,
        },
        indicators: {
          cvRank: application.matchScore || 0,
          english: 50,
          bodyLanguage: 50,
        },
      });
    }
    return {
      jobId: String(jobId),
      totalApplications: totalApplications,
      applicationsToday: applicationsToday,
      shortlistedCandidates: shortlistedCandidates,
      averageMatchScore: avgMatchScore,
      dashboardData: dashboardData,
      pagination: {
        page,
        limit,
        total: totalFilteredApplications,
      },
    };
  }

  public async updateApplicationStatus(
    userPayload: UserDocument,
    applicationId: string,
    dto: UpdateJobDashboardApplicationRequestDto,
  ): Promise<DashboardDataDto> {
    this.assertHrUser(userPayload);
    const application = await this.jobApplicationModel
      .findById(applicationId)
      .exec();
    if (!application) {
      throw new ForbiddenException('Application not found');
    }
    application.status = dto.applicationStatus;
    if (dto.applicationStatus === ApplicationStatus.ACCEPTED) {
      application.hiredAt = new Date();
    }
    if (dto.applicationStatus === ApplicationStatus.INTERVIEW) {
      application.interviewed = true;
    }
    await application.save();
    const candidateInfo = await this.getCandidateInfo(
      String(application.candidateId),
    );

    return {
      applicationId: String(application._id),
      candidate: {
        candidateId: String(application.candidateId),
        name: candidateInfo.fullName,
        role: candidateInfo.currentJobTitle,
      },
      application: {
        applicationStatus: application.status,
      },
      match: {
        matchScore: application.matchScore,
      },
      indicators: {
        cvRank: application.matchScore,
        english: 50,
        bodyLanguage: 50,
      },
    };
  }

  private async getJobTitle(jobId: string): Promise<string> {
    const job = await this.jobModel.findById(jobId).exec();
    return job ? job.title : '';
  }

  public async exportDashboardData(
    userPayload: UserDocument,
    jobId: string,
    query: jobDasboardExportRequestDto,
    res: Response,
  ) {
    this.assertHrUser(userPayload);
    const { applicationStatus, matchScore } = query;
    const applications = await this.getApplications(
      String(jobId),
      1,
      Number.MAX_SAFE_INTEGER,
      applicationStatus,
      matchScore,
    );
    const dashboardData = [] as DashboardDataDto[];
    const applicationsToday = await this.getJobApplicationCountToday(
      String(jobId),
    );
    const shortlistedCandidates = await this.getShortlistedCandidatesCount(
      String(jobId),
    );
    const avgMatchScore = await this.getAverageMatchScore(String(jobId));
    const totalApplications = await this.getJobApplicationCount(String(jobId));
    const jobTitle = await this.getJobTitle(String(jobId));
    const headers = {
      jobTitle: jobTitle,
      totalApplications: totalApplications,
      applicationsToday: applicationsToday,
      shortlistedCandidates: shortlistedCandidates,
      averageMatchScore: avgMatchScore,
    };
    for (const application of applications) {
      const candidateInfo = await this.getCandidateInfo(
        String(application.candidateId),
      );
      dashboardData.push({
        applicationId: String(application._id),
        candidate: {
          candidateId: String(application.candidateId),
          name: candidateInfo.fullName,
          role: candidateInfo.currentJobTitle,
        },
        application: {
          applicationStatus: application.status,
        },
        match: {
          matchScore: application.matchScore,
        },
        indicators: {
          cvRank: application.matchScore,
          english: 50,
          bodyLanguage: 50,
        },
      });
    }
    return this.exportService.export(query.format, headers, dashboardData, res);
  }

  public async getApplicationSummary(
    userPayload: UserDocument,
    applicationId: string,
  ): Promise<ApplicationSummaryResponseDto> {
    this.assertHrUser(userPayload);
    const application = await this.jobApplicationModel
      .findById(applicationId)
      .exec();
    if (!application) {
      throw new ForbiddenException('Application not found');
    }
    const applicationSummary =
      application.feedbackSummary || 'No summary available';
    return {
      applicationSummary,
    };
  }
}
