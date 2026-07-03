import {
  Controller,
  Get,
  Res,
  Patch,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { CurrentUser } from 'src/decorators/currentPayload';
import { UserDocument } from 'src/database/schemas/user.schema';
import { JobDashboardService } from './jobDashboard.service';
import { JobDashboardResponseDto } from './dtos/response/jobDashboardResponse.dto';
import { JobApplicationResponseDto } from './dtos/response/jobApplicationResponse.dto';
import { JobDashboardRequestDto } from './dtos/request/JobDashboardRequest.dto';
import { UpdateJobDashboardApplicationRequestDto } from './dtos/request/updateJobDashboardApplicationRequest.dto';
import { DashboardDataDto } from './dtos/response/dashboardData.dto';
import { jobDasboardExportRequestDto } from './dtos/request/jobDashboardExportRequest.dto';
import { Response } from 'express';
import { ApplicationSummaryResponseDto } from './dtos/response/applicationSummaryResponse.dto';

@ApiTags('JobDashboard')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('jobs/:jobId/dashboard')
export class JobDashboardController {
  constructor(private readonly jobDashboardService: JobDashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get job dashboard data' })
  @ApiParam({ name: 'jobId', description: 'ID of the job post' })
  @ApiResponse({
    status: 200,
    description: 'Job dashboard data retrieved successfully',
    type: JobDashboardResponseDto,
  })
  public async getJobDashboard(
    @CurrentUser() userPayload: UserDocument,
    @Param('jobId') jobId: string,
    @Query() query: JobDashboardRequestDto,
  ): Promise<JobDashboardResponseDto> {
    return this.jobDashboardService.getJobDashboard(userPayload, jobId, query);
  }

  // update application status from dashboard
  @Patch('applications/:applicationId/status')
  @ApiOperation({ summary: 'Update job application status from dashboard' })
  @ApiParam({ name: 'applicationId', description: 'ID of the job application' })
  @ApiResponse({
    status: 200,
    description: 'Job application status updated successfully',
    type: DashboardDataDto,
  })
  public async updateApplicationStatus(
    @CurrentUser() userPayload: UserDocument,
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateJobDashboardApplicationRequestDto,
  ): Promise<DashboardDataDto> {
    return this.jobDashboardService.updateApplicationStatus(
      userPayload,
      applicationId,
      dto,
    );
  }

  // get candidate email from dashboard

  // export dashboard data as CSV or Excel
  @Get('export')
  @ApiOperation({ summary: 'Export job dashboard data as CSV or Excel' })
  @ApiParam({ name: 'jobId', description: 'ID of the job post' })
  @ApiResponse({
    status: 200,
    description: 'Job dashboard data exported successfully',
    type: Response,
  })
  public async exportDashboardData(
    @CurrentUser() userPayload: UserDocument,
    @Query() query: jobDasboardExportRequestDto,
    @Param('jobId') jobId: string,
    @Res() res: Response,
  ) {
    return this.jobDashboardService.exportDashboardData(
      userPayload,
      jobId,
      query,
      res,
    );
  }

  // get candidate application summary
  @Get('applications/:applicationId/summary')
  @ApiOperation({ summary: 'Get job application summary for a candidate' })
  @ApiParam({ name: 'applicationId', description: 'ID of the job application' })
  @ApiResponse({
    status: 200,
    description: 'Job application summary retrieved successfully',
    type: ApplicationSummaryResponseDto,
  })
  public async getApplicationSummary(
    @CurrentUser() userPayload: UserDocument,
    @Param('applicationId') applicationId: string,
  ): Promise<ApplicationSummaryResponseDto> {
    return this.jobDashboardService.getApplicationSummary(
      userPayload,
      applicationId,
    );
  }

  // end job by sending feedbacks to the candidates and final results

  //implement application tracker api
}
