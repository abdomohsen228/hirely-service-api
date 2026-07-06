import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
import { CandidateInterviewDocument,CandidateInterview } from 'src/database/schemas/candidate_interview.schema';
import { CandidateInterviewStatus } from 'src/database/enums/candidateInterviewStatus.enum';
import { InterviewSprint, InterviewSprintDocument } from 'src/database/schemas/interview_sprint.schema';
import { EmailService } from '../email/email.service';
import { UserJobScore, UserJobScoreDocument} from 'src/database/schemas/user_job_score.schema';
// import { VideoAiAnalysis, VideoAiAnalysisDocument } from 'src/database/schemas/video_ai_analysis.schema';
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
    @InjectModel(CandidateInterview.name) private readonly canidateInterviewModel: Model<CandidateInterviewDocument>,
    @InjectModel(InterviewSprint.name) private readonly interviewSprintModel: Model<InterviewSprintDocument>,
    @InjectModel(UserJobScore.name) private readonly UserJobScoreModel: Model<UserJobScoreDocument>,
    private readonly EmailService: EmailService,
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

async getAverageMatchScore(jobId: string): Promise<number> {
  const [result] = await this.UserJobScoreModel.aggregate([
    {
      $match: {
        jobId: new Types.ObjectId(jobId),
      },
    },
    {
      $group: {
        _id: null,
        average: { $avg: '$score' },
      },
    },
  ]);

  return result?.average ?? 0;
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

    let applications = await this.jobApplicationModel.find(filter).exec();

    // Get UserJobScore records for all applications
    const candidateIds = applications.map((app) => app.candidateId);
    const jobScores = await this.UserJobScoreModel
      .find({ jobId: new Types.ObjectId(jobId), candidateId: { $in: candidateIds } })
      .exec();

    console.log(`[JobDashboard] Found ${jobScores.length} UserJobScore records for ${candidateIds.length} candidates`);

    const scoreMap = new Map(
      jobScores.map((score) => [score.candidateId.toString(), score.score]),
    );

    // Attach scores to applications
    const applicationsWithScores = applications.map((app) => {
      const score = scoreMap.get(app.candidateId.toString());
      console.log(`[JobDashboard] Application ${app._id}, Candidate ${app.candidateId}, Score: ${score}`);
      return {
        ...app.toObject(),
        matchScore: score || 0,
      };
    });

    // Filter by matchScore if provided
    let filteredApplications = applicationsWithScores;
    if (matchScore !== undefined) {
      filteredApplications = applicationsWithScores.filter(
        (app) => app.matchScore >= matchScore,
      );
    }

    // Sort by matchScore if filter is provided
    if (matchScore !== undefined) {
      filteredApplications.sort((a, b) => b.matchScore - a.matchScore);
    }

    // Apply pagination
    return filteredApplications.slice(skip, skip + limit);
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

    let applications = await this.jobApplicationModel.find(filter).exec();

    // Get UserJobScore records for all applications
    const candidateIds = applications.map((app) => app.candidateId);
    const jobScores = await this.UserJobScoreModel
      .find({ jobId: new Types.ObjectId(jobId), candidateId: { $in: candidateIds } })
      .exec();

    const scoreMap = new Map(
      jobScores.map((score) => [score.candidateId.toString(), score.score]),
    );

    // Attach scores to applications
    const applicationsWithScores = applications.map((app) => ({
      ...app.toObject(),
      matchScore: scoreMap.get(app.candidateId.toString()) || 0,
    }));

    // Filter by matchScore if provided
    if (matchScore !== undefined) {
      return applicationsWithScores.filter(
        (app) => app.matchScore >= matchScore,
      ).length;
    }

    return applicationsWithScores.length;
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
    const normalizedMatchScore = matchScore !== undefined ? Math.round(matchScore * 100) / 100 : undefined;
    console.log(`[getJobDashboard] jobId: ${jobId}, matchScore: ${matchScore}, normalizedMatchScore: ${normalizedMatchScore}, applicationStatus: ${applicationStatus}`);
    const applications = await this.getApplications(
      String(jobId),
      page,
      limit,
      applicationStatus,
      normalizedMatchScore,
    );
    console.log(`[getJobDashboard] Applications returned: ${applications.length}`);
    const totalFilteredApplications = await this.getFilteredApplicationsCount(
      String(jobId),
      applicationStatus,
      normalizedMatchScore,
    );
    // const CVRank = await this.
    const dashboardData = [] as DashboardDataDto[];
    for (const application of applications) {
      const candidateInfo = await this.getCandidateInfo(
        String(application.candidateId),
      );

      const analysis  = await this.videoAiAnalysisModel.findOne({applicationId:application._id}).exec();
      let english = 0;
      let body = 0;
      if(analysis){
        for(const video of analysis.videos)
        {
          english+=video.audio.english_level_score;
          body+=video.body_language.scores.overall_body_score;
        }
        english = (english/analysis.feedback.videos_analyzed) *100;
        body = (body/analysis.feedback.videos_analyzed)*100;
      }
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
          matchScore: application.matchScore || 0,
        },
        indicators: {
          cvRank: application.matchScore || 0,
          english: english,
          bodyLanguage: body,
        },
      });
    }
    // const job = await this.jobModel.findById(new Types.ObjectId(jobId)).exec();
    return {
      jobId: String(jobId),
      totalApplications: totalApplications,
      applicationsToday: applicationsToday,
      shortlistedCandidates: shortlistedCandidates,
      averageMatchScore: Math.round(avgMatchScore * 100) / 100,
      dashboardData: dashboardData,
      pagination: {
        page,
        limit,
        total: totalFilteredApplications,
      },
      // state
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
    const candidate = await this.candidateModel.findById(application.candidateId).exec();
      if(!candidate)
        throw new NotFoundException('Candidate not found');
    const user = await this.userModel.findById(candidate.user).exec();
    application.status = dto.applicationStatus;
    const job = await this.jobModel.findOne({_id:application.jobId}).exec();
    if (dto.applicationStatus === ApplicationStatus.ACCEPTED) {
      application.hiredAt = new Date();
      application.currentStage = application.totalStages;
      application.nextStepAt = null;
      application.nextStepTitle = "Accepted";
      await this.EmailService.sendApplicationAcceptedEmail(candidate.fullName,user.email,job.title);
    }
    if (dto.applicationStatus === ApplicationStatus.INTERVIEW) {
      // application.interviewed = true;
      application.currentStage = 3;
      application.nextStepAt = job.interviewEndDate;
      application.nextStepTitle = "Start Interview";
      const candidateInterview  = await this.canidateInterviewModel.findOne({applicationId:application._id});
      if(candidateInterview){
        candidateInterview.status = CandidateInterviewStatus.INVITED;
        candidateInterview.save();
      }else{
        const interviewSprint =  await this.interviewSprintModel.findOne({jobId:job._id}).exec();
        if(!interviewSprint) throw new NotFoundException('Interview Sprint havent started yet!');
        await this.canidateInterviewModel.create({
          sprintId: interviewSprint._id,
          applicationId: application._id,
          jobId: job._id,
          status: CandidateInterviewStatus.INVITED,
          started_at: null,
          submitted_at: null
        })
      }
      await this.EmailService.sendInterviewInvitationEmail(
        candidate.fullName,
        user.email,
        job.title,
        job.interviewStartDate,
        job.interviewEndDate
      );
    }
    if (dto.applicationStatus === ApplicationStatus.REJECTED) {
      if (application.status === ApplicationStatus.CV_FAILED) {
        const uniqueSkills = job.skills.filter((skill) => !candidate.skills.includes(skill));
        if(uniqueSkills.length > 0)
          await this.EmailService.sendCvRejectionEmail(candidate.fullName, user.email, job.title, uniqueSkills);
        application.feedbackSummary = "Rejected due to CV not matching the job requirements";
      }
      // application.interviewed = true;
      application.currentStage = application.totalStages;
      application.nextStepAt = null;
      if (!application.feedbackSummary)
        application.nextStepTitle = "Waiting FeedBack Summary";
      else
        application.nextStepTitle = "Finished";
    }
    await application.save();
    const candidateInfo = await this.getCandidateInfo(
      String(application.candidateId),
    );
    const UserJobscore = await this.UserJobScoreModel.findOne({candidateId:candidate._id, jobId:job._id}).exec();
    console.log(UserJobscore);
    const analysis  = await this.videoAiAnalysisModel.findOne({applicationId:application._id}).exec();
    let english = 0;
    let body = 0;
    if(analysis){
      for(const video of analysis.videos)
      {
        english+=video.audio.english_level_score;
        body+=video.body_language.scores.overall_body_score;
      }
      english = (english/analysis.feedback.videos_analyzed) *100;
      body = (body/analysis.feedback.videos_analyzed)*100;
    }
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
        matchScore: UserJobscore?.score || 0,
      },
      indicators: {
        cvRank: UserJobscore?.score || 0,
        english: english,
        bodyLanguage: body,
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
