import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { CurrentUser } from 'src/decorators/currentPayload';
import { UserDocument } from 'src/database/schemas/user.schema';
import { JobService } from './job.service';
import { CreateJobPostRequestDto } from './dtos/request/createJobPostRequest.dto';
import { ListJobPostsQueryDto } from './dtos/request/listJobPostsQuery.dto';
import { ListMyApplicationsQueryDto } from './dtos/request/listMyApplicationsQuery.dto';
import { UpdateHrJobApplicationRequestDto } from './dtos/request/updateHrJobApplicationRequest.dto';
import { UpdateJobPostRequestDto } from './dtos/request/updateJobPostRequest.dto';
import { JobPostResponseDto } from './dtos/response/jobPostResponse.dto';
import { MyApplicationsStatsResponseDto } from '../applications/dtos/response/myApplicationsStatsResponse.dto';
import { MyJobApplicationItemResponseDto } from './dtos/response/myJobApplicationItemResponse.dto';
import { PaginatedJobListResponseDto } from './dtos/response/paginatedJobListResponse.dto';
import { PaginatedMyJobApplicationsResponseDto } from './dtos/response/paginatedMyJobApplicationsResponse.dto';
import { RecommendedJobItemResponseDto } from './dtos/response/recommendedJobItemResponse.dto';

@ApiTags('Jobs')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) { }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'HR: create a new job post' })
  @ApiBody({ type: CreateJobPostRequestDto })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Job post created',
    type: JobPostResponseDto,
  })
  public async createJobPost(
    @CurrentUser() userPayload: UserDocument,
    @Body() dto: CreateJobPostRequestDto,
  ): Promise<JobPostResponseDto> {
    return this.jobService.createJobPost(userPayload, dto);
  }

  @Get()
  @ApiOperation({
    summary: 'HR: list my job posts, Candidate: list open jobs (paginated)',
  })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedJobListResponseDto,
  })
  public async listJobPosts(
    @CurrentUser() userPayload: UserDocument,
    @Query() query: ListJobPostsQueryDto,
  ): Promise<PaginatedJobListResponseDto> {
    return this.jobService.listJobPosts(userPayload, query);
  }

  @Get('recommended')
  @ApiOperation({
    summary: 'Candidate: list recommended jobs based on AI matching',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [RecommendedJobItemResponseDto],
  })
  public async getRecommendedJobs(
    @CurrentUser() userPayload: UserDocument,
  ): Promise<RecommendedJobItemResponseDto[]> {
    return this.jobService.getRecommendedJobs(userPayload);
  }

  @Get('recent')
  @ApiOperation({
    summary: 'Candidate/HR: Get most recent 5 open jobs',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [JobPostResponseDto],
  })
  public async getRecentJobs(): Promise<JobPostResponseDto[]> {
    return this.jobService.getRecentJobs();
  }

  @Get(':id')
  @ApiOperation({ summary: 'HR/Candidate: get a job post by id' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiResponse({ status: HttpStatus.OK, type: JobPostResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  public async getJobPostById(
    @CurrentUser() userPayload: UserDocument,
    @Param('id') id: string,
  ): Promise<JobPostResponseDto> {
    return this.jobService.getJobPostById(userPayload, id);
  }

  @Post(':id/apply')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Candidate: apply to an open job post' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    type: MyJobApplicationItemResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid job id or already applied',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Only candidates can apply to jobs',
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  public async applyToJob(
    @CurrentUser() userPayload: UserDocument,
    @Param('id') id: string,
  ): Promise<MyJobApplicationItemResponseDto> {
    return this.jobService.applyToJob(userPayload, id);
  }

  @Patch(':jobId/applications/:applicationId')
  @ApiOperation({
    summary:
      'HR: update application pipeline (status, stages, next step, match score)',
  })
  @ApiParam({ name: 'jobId', description: 'Job id' })
  @ApiParam({ name: 'applicationId', description: 'Application id' })
  @ApiBody({ type: UpdateHrJobApplicationRequestDto })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MyJobApplicationItemResponseDto,
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Not found' })
  public async updateHrJobApplication(
    @CurrentUser() userPayload: UserDocument,
    @Param('jobId') jobId: string,
    @Param('applicationId') applicationId: string,
    @Body() dto: UpdateHrJobApplicationRequestDto,
  ): Promise<MyJobApplicationItemResponseDto> {
    return this.jobService.updateHrJobApplication(
      userPayload,
      jobId,
      applicationId,
      dto,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'HR: update a job post' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiBody({ type: UpdateJobPostRequestDto })
  @ApiResponse({ status: HttpStatus.OK, type: JobPostResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  public async updateJobPost(
    @CurrentUser() userPayload: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateJobPostRequestDto,
  ): Promise<JobPostResponseDto> {
    return this.jobService.updateJobPost(userPayload, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'HR: delete a job post' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Job deleted' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  public async deleteJobPost(
    @CurrentUser() userPayload: UserDocument,
    @Param('id') id: string,
  ): Promise<void> {
    return this.jobService.deleteJobPost(userPayload, id);
  }

  @Get(':id/questions')
  @ApiOperation({ summary: 'HR/Candidate: get interviewer questions for a job' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: [String],
  })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  public async getInterviewerQuestions(
    @CurrentUser() userPayload: UserDocument,
    @Param('id') id: string,
  ): Promise<string[]> {
    return this.jobService.getInterviewerQuestions(userPayload, id);
  }
}
