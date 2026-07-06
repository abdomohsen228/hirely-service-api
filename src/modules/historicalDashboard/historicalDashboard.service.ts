import { Injectable } from "@nestjs/common";
import { HistoricalDashboardResponseDto } from "./dtos/response/HistoricalDashboardResponse.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "src/database/schemas/user.schema";
import { JobApplicationDocument } from "src/database/schemas/application.schema";
import { CandidateDocument } from "src/database/schemas/candidate.schema";
import { JobDashboardService } from "../jobDashboard/jobDashboard.service";
import { JobDocument } from "src/database/schemas/jobs.schema";
import { HistoricalDashboardRequestDto } from "./dtos/request/HistoricalDashboardRequest.dto";
import { Types } from "mongoose";
import { UserRole } from "src/database/enums/userRole.enum";
import { ForbiddenException, NotFoundException } from "@nestjs/common";
import { HydratedDocument } from "mongoose";
import { ApplicationStatus } from "src/database/enums/applicationStatus.enum";
import { application } from "express";
import { InflowFilter } from "src/database/enums/historicalDashboardInflowFilter.enum";
import { DashboardHeaders } from "./dtos/response/DashboardHeade4rs.dto";
import { RecruitmentFunnel } from "./dtos/response/RecruitmentFunnel.dto";
import { ApplicationInflowTrendDto } from "./dtos/response/ApplicationInflowTrend.dto";
import { VolumeByDepartmentDto } from "./dtos/response/VolumeByDepartment.dto";
import { ActiveHiringProcessDto } from "./dtos/response/ActiveHiringProcess.dto";
import { ActiveHiringProcessFieldDto } from "./dtos/response/ActiveHiringProcessField.dto";
import { InflowFieldDto } from "./dtos/response/InflowField.dto";
import { DepartmetFieldDto } from "./dtos/response/DepartmentField.dto";
import { PaginationRequestDto } from "./dtos/request/PaginationRequest.dto";
@Injectable()
export class HistoricalDashboardService {
    constructor(
        @InjectModel('User') private readonly userModel: Model<UserDocument>,
        @InjectModel('JobApplication') private readonly jobApplicationModel: Model<JobApplicationDocument>,
        @InjectModel('Candidate') private readonly candidateModel: Model<CandidateDocument>,
        @InjectModel('Job') private readonly jobModel: Model<JobDocument>,
        // private readonly jobDashboardService: JobDashboardService
    ) { }

    private assertHrUser(user: UserDocument): void {
        if (user.role !== UserRole.HR) {
            throw new ForbiddenException('Only HR users can manage job posts');
        }
    }

    // for total applications
    private async getTotalApplicationCount(userId: Types.ObjectId) {
        const jobs = await this.jobModel.find({ createdBy: userId }).exec();
        let applications = 0;
        for (const job of jobs) {
            applications += await this.jobApplicationModel.countDocuments({ jobId: job._id })
        }
        return applications;
    }

    // for total count analysis { this month and past month }
    private async getJobApplicationCountMonth(userId: Types.ObjectId, date: Date) {
        const startOfNextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        const jobs = await this.getHRJobs(userId);
        let applications = 0;
        for (const job of jobs) {
            applications += await this.jobApplicationModel.countDocuments({
                jobId: job._id,
                appliedAt: {
                    $gte: date,
                    $lt: startOfNextMonth
                }
            }).exec();
        }
        console.log(`applications for month ${date} are: `,applications);
        return applications;
    }

    private async getHRJobs(userId: Types.ObjectId): Promise<JobDocument[]> {
        console.log('userID',userId);
        return await this.jobModel.find({ createdBy: userId }).exec();
    }

    private async computeInterviewRate(userId: Types.ObjectId, jobs: JobDocument[]) {
        const applications = await this.getTotalApplicationCount(userId);
        const interviews = await this.numOFInterviewed(jobs);

        return interviews / applications;
    }

    // for ai effeciency will need number of applications and number of hired 
    private async computeAiEfficiency(userId: Types.ObjectId, jobs: JobDocument[]) {
        const apps = await this.getTotalApplicationCount(userId);
        const hires = await this.numOFHired(jobs);
        if (hires == 0) return 0;
        return ((hires / apps) * 100) - 100;
    }

    // for time to hire will need date of accepted and application date
    private async computeAverageTimeToHire(jobs: JobDocument[]) {
        let totalHiredCount = 0;
        let totalTimeMs = 0;
        // Loop through each job
        for (const job of jobs) {
            // Fetch the accepted/hired applications for this specific job
            const hiredApplications = await this.jobApplicationModel.find({
                jobId: job._id,
                status: ApplicationStatus.ACCEPTED
            }).lean().exec();

            // Loop through the accepted applications to calculate time differences
            for (const app of hiredApplications) {
                if (app.appliedAt && app.hiredAt) {
                    const appliedTime = new Date(app.appliedAt).getTime();
                    const hiredTime = new Date(app.hiredAt).getTime();
                    const timeDiffMs = hiredTime - appliedTime;

                    // Ensure data entigrity (skip if hiredAt is before appliedAt)
                    if (timeDiffMs >= 0) {
                        totalTimeMs += timeDiffMs;
                        totalHiredCount++;
                    }
                }
            }
        }

        if (totalHiredCount === 0) {
            return 0;
        }
        // Convert total milliseconds to days
        const totalTimeInDays = totalTimeMs / (1000 * 60 * 60 * 24);
        const averageDaysToHire = totalTimeInDays / totalHiredCount;

        return Math.round(averageDaysToHire * 10) / 10;
    }
    // for the recruitment funnel data will need all the applications, state: inreview, interview, acc 
    private async numOFInterviewed(jobs: JobDocument[]) {
        let interviews = 0;
        for (const job of jobs) {
            interviews += await this.jobApplicationModel.countDocuments({
                jobId: job._id,
                interviewed: true
            }).exec();
        }

        return interviews;
    }
    private async numOFScreened(jobs: JobDocument[]) {
        let screens = 0;
        for (const job of jobs) {
            screens += await this.jobApplicationModel.countDocuments({
                jobId: job._id,
                $or: [
                    { status: ApplicationStatus.IN_REVIEW },
                    { currentStage: { $gte: 2 } }
                ]
            }).exec();
        }

        return screens;
    }
    private async numOFHired(jobs: JobDocument[]) {
        let hires = 0;
        for (const job of jobs) {
            hires += await this.jobApplicationModel.countDocuments({
                jobId: job._id,
                status: ApplicationStatus.ACCEPTED
            }).exec();
        }

        return hires;
    }
    private async numOFHiredWithoutInterview(jobs: JobDocument[]) {
        let hires = 0;
        for (const job of jobs) {
            hires += await this.jobApplicationModel.countDocuments({
                jobId: job._id,
                status: ApplicationStatus.ACCEPTED,
                interviewed: false
            }).exec();
        }

        return hires;
    }

    // for recruitment funnel cv-to-hire will need total apps, number of acc and num of interviewed: false
    private CVToHire(hiredCV: number, apps: number) {
        return (hiredCV / apps) * 100;
    }

    private InterviewToHire(hiredInterview: number, apps: number) {
        return (hiredInterview / apps) * 100;
    }

    // for application inflow will need current month and num of month stats to descending 
    private async generateApplicationInflow(userId: Types.ObjectId, filter: InflowFilter) {
        const now = new Date();
        let startDate: Date | null = null;

        // Calculate the starting boundary based on the interval case
        if (filter === InflowFilter.LAST_6_MONTHS) {
            startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);
        } else if (filter === InflowFilter.LAST_YEAR) {
            startDate = new Date(now.getFullYear(), 0, 1);
        }
        const jobs = await this.getHRJobs(userId);
        const jobIds = jobs.map(job => job._id);

        const matchStage: any = {
            jobId: { $in: jobIds }
        };
        if (startDate) {
            matchStage.appliedAt = { $gte: startDate };
        }

        const rawStats = await this.jobApplicationModel.aggregate([
            { $match: matchStage },
            {
                $group: {
                    _id: {
                        year: { $year: '$appliedAt' },
                        month: { $month: '$appliedAt' },
                    },
                    count: { $sum: 1 },
                },
            },
            {
                $sort: {
                    '_id.year': 1,
                    '_id.month': 1,
                },
            },
        ]).exec();

        // Map the results to months
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const inflowData = rawStats.map(item => ({
            month: `${monthNames[item._id.month - 1]} ${item._id.year}`,
            applicants: item.count
        }));

        const applicationsPerInterval = inflowData.reduce((sum, current) => sum + current.applicants, 0);

        return {
            applicationsPerInterval,
            inflowData
        };

    }

    // for volume by department will need each job post and it's departmet with commulative apps
    private async generateVolumeByDepartment(jobs: JobDocument[], page: number, limit: number) {

        const totalItems = jobs.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedData = jobs.slice(startIndex, endIndex);
        const departments = [];
        for (const job of paginatedData) {
            const applications = await this.jobApplicationModel.countDocuments({ jobId: job._id }).exec();
            const department = job.department;

            // Check if we already added this department to the array
            const existingDept = departments.find(d => d.key === department);

            if (existingDept) {
                existingDept.value += applications;
            } else {
                departments.push({ key: department, value: applications });
            }
        }

        return {
            departments,
            totalPages
        };

    }

    // for active hiring will need fetching each job's data + computing hiring progress by taking percentage from the start date and end date
    private async generateActiveJobs(userId: Types.ObjectId, page: number, limit: number) {

        const jobs = await this.jobModel.find({
            createdBy: userId,
            interviewEndDate: {
                $gte: new Date()
            }
        })
        const totalItems = jobs.length;
        const totalPages = Math.ceil(totalItems / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedData = jobs.slice(startIndex, endIndex);
        const activeJobs: { 
            role_name: string; 
            department: string; 
            hiring_progress: number; 
            target_date: Date; 
            jobId: string;
            }[] = [];
        for (const job of paginatedData) {
            const role_name = job.title;
            const department = job.department;
            let hiring_progress = 0;

            const now = new Date();

            if (now >= job.interviewStartDate) {
                const totalDuration = now.getTime() - job.interviewStartDate.getTime();
                hiring_progress = (totalDuration / (job.sprintDuration*7)) * 100;

                if (hiring_progress > 100 || hiring_progress < 0) hiring_progress = 100;

            } else {
                hiring_progress = 0; // Hasn't started yet
            }

            const target_date = job.interviewEndDate;

            activeJobs.push({
                role_name: role_name,
                department: department,
                hiring_progress: hiring_progress,
                target_date: target_date,
                jobId: job._id.toString()
            });
        }

        return {
            activeJobs,
            activeTotalPages: totalPages
        };

    }

    // Dashboard Data
    public async getDashboard(user: UserDocument, query: HistoricalDashboardRequestDto): Promise<HistoricalDashboardResponseDto> {
        this.assertHrUser(user);
        const {
            inflow_filter,
            volume_pagination = {
                page: 1,
                limit: 5
            },
            active_pagination = {
                page: 1,
                limit: 5
            }
        } = query;
        const hrJobs = await this.getHRJobs(user._id);
        if (hrJobs.length==0) throw new NotFoundException('Did not Find any jobs for this user');

        //---- header data
        const totalApplications = await this.getTotalApplicationCount(user._id);
        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const pastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const applicationProgress =
            await this.getJobApplicationCountMonth(user._id, thisMonth)
            - await this.getJobApplicationCountMonth(user._id, pastMonth);
        const interviewRate = await this.computeInterviewRate(user._id, hrJobs);
        const timeToHire = await this.computeAverageTimeToHire(hrJobs);
        const aiEfficiency = await this.computeAiEfficiency(user._id, hrJobs);

        //---- recruitment funnel data
        const interviewed = await this.numOFInterviewed(hrJobs);
        const screened = await this.numOFScreened(hrJobs);
        const hired = await this.numOFHired(hrJobs);
        const hiredCV = await this.numOFHiredWithoutInterview(hrJobs);
        const hiredInterview = hired - hiredCV;
        const cv_to_hire = this.CVToHire(hiredCV, totalApplications);
        const interview_to_hire = this.InterviewToHire(hiredInterview, totalApplications);

        //---- applications inflow
        const { applicationsPerInterval, inflowData } = await this.generateApplicationInflow(user._id, inflow_filter);

        //---- volume by departments
        const { totalPages, departments } = await this.generateVolumeByDepartment(hrJobs, volume_pagination.page, volume_pagination.limit);

        //----- active hiring
        const { activeTotalPages, activeJobs } = await this.generateActiveJobs(user._id, active_pagination.page, active_pagination.limit);

        // dashboard sections
        const headers: DashboardHeaders = {
            totalApplications: totalApplications,
            totalApplications_analysis: applicationProgress,
            interviewRate: interviewRate,
            interviewRate_baseline: 15, // don't know what should i do here
            tthire: timeToHire,
            tthire_analysis: 2, // will be dited later
            modelEfficiency: aiEfficiency
        }

        const recruitement_funnel: RecruitmentFunnel = {
            applications: totalApplications,
            screened: screened,
            interviewed: interviewed,
            hired: hired,
            cv_to_hire: cv_to_hire,
            interview_to_hire: interview_to_hire
        }

        const inflowField: InflowFieldDto[] = [];
        for (const data of inflowData) {
            inflowField.push({
                month: data.month,
                total_applications: data.applicants
            })
        }

        const inflow_trend: ApplicationInflowTrendDto = {
            inflowFilter: inflow_filter,
            inflowData: inflowField,
            totalApplications: applicationsPerInterval
        }

        const department_pagination: PaginationRequestDto = {
            page: volume_pagination.page,
            limit: volume_pagination.limit,
            total: totalPages
        }

        const departmentField: DepartmetFieldDto[] = [];
        for (const department of departments) {
            departmentField.push({
                department: department.key,
                applications: department.value
            })
        }
        const volume_by_department: VolumeByDepartmentDto = {
            department_pagination: department_pagination,
            departmentData: departmentField
        }

        const activePagination: PaginationRequestDto = {
            page: active_pagination.page,
            limit: active_pagination.limit,
            total: activeTotalPages

        }
        const activeHiringFields: ActiveHiringProcessFieldDto[] = [];
        for (const activeJob of activeJobs) {
            activeHiringFields.push({
                Role_name: activeJob.role_name,
                department: activeJob.department,
                hiring_progress: activeJob.hiring_progress,
                target_date: activeJob.target_date,
                jobId: activeJob.jobId
            })
        }
        const active_hiring_process: ActiveHiringProcessDto = {
            paginationInfo: activePagination,
            activeHiringFields: activeHiringFields
        }

        return {
            headers: headers,
            recruitement_funnel: recruitement_funnel,
            inflow_trend: inflow_trend,
            volume_by_department: volume_by_department,
            active_hiring_process: active_hiring_process
        }
    }

    public async getJobOpenings(user: UserDocument): Promise<ActiveHiringProcessFieldDto[]> {
        this.assertHrUser(user);
        const hrJobs = await this.getHRJobs(user._id);
        if (hrJobs.length==0) throw new NotFoundException('Did not Find any jobs for this user');
        const activeJobs = await this.generateActiveJobs(user._id, 1, hrJobs.length);
        const res: ActiveHiringProcessFieldDto[] = [];
        for (const job of activeJobs.activeJobs) {
            res.push({
                Role_name: job.role_name,
                department: job.department,
                hiring_progress: job.hiring_progress,
                target_date: job.target_date,
                jobId: job.jobId
            })
        }
        return res;
    };
}
