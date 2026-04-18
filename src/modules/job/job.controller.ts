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
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { CurrentUser } from 'src/decorators/currentPayload';
import { UserDocument } from 'src/database/schemas/user.schema';
import { JobService } from './job.service';
import { CreateJobPostRequestDto } from './dtos/request/createJobPostRequest.dto';
import { ListJobPostsQueryDto } from './dtos/request/listJobPostsQuery.dto';
import { UpdateJobPostRequestDto } from './dtos/request/updateJobPostRequest.dto';
import { JobPostResponseDto } from './dtos/response/jobPostResponse.dto';
import { PaginatedJobListResponseDto } from './dtos/response/paginatedJobListResponse.dto';

@ApiTags('Jobs')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

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
  @ApiOperation({ summary: 'HR: list my job posts (paginated)' })
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

  @Get(':id')
  @ApiOperation({ summary: 'HR: get a job post by id' })
  @ApiParam({ name: 'id', description: 'Job id' })
  @ApiResponse({ status: HttpStatus.OK, type: JobPostResponseDto })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Job not found' })
  public async getJobPostById(
    @CurrentUser() userPayload: UserDocument,
    @Param('id') id: string,
  ): Promise<JobPostResponseDto> {
    return this.jobService.getJobPostById(userPayload, id);
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
}
