import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { CurrentUser } from 'src/decorators/currentPayload';
import { UserDocument } from 'src/database/schemas/user.schema';
import { JobService } from './job.service';
import { CreateJobPostRequestDto } from './dtos/request/createJobPostRequest.dto';
import { JobPostResponseDto } from './dtos/response/jobPostResponse.dto';

@ApiTags('Jobs')
@ApiBearerAuth()
@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @ApiBearerAuth('access-token')
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
}
