
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { CurrentUser } from 'src/decorators/currentPayload';
import { UserDocument } from 'src/database/schemas/user.schema';
import { JobDashboardService } from './jobDashboard.service';
// import { JobDashboardResponseDto } from './dtos/response/jobDashboardResponse.dto';

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
  // type: JobDashboardResponseDto,
    })
    public async getJobDashboard(@Param('jobId') jobId: string, @CurrentUser() userPayload: UserDocument) {
    return this.jobDashboardService.getJobDashboard(jobId, userPayload);
  }
}
