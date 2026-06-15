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
import { ApplicationsService } from './applications.service';
import { MyApplicationsStatsResponseDto } from './dtos/response/myApplicationsStatsResponse.dto';
import { MyJobApplicationItemResponseDto } from '../job/dtos/response/myJobApplicationItemResponse.dto';
import { ListMyApplicationsQueryDto } from '../job/dtos/request/listMyApplicationsQuery.dto';
import { PaginatedMyJobApplicationsResponseDto } from '../job/dtos/response/paginatedMyJobApplicationsResponse.dto';
@ApiTags('Applications')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly applicationService: ApplicationsService) {}

  @Get('me/stats')
  @ApiOperation({
    summary:
        'Candidate: tracker stats (totals, upcoming interviews, best match)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MyApplicationsStatsResponseDto,
  })
  public async getMyApplicationStats(
    @CurrentUser() userPayload: UserDocument,
  ): Promise<MyApplicationsStatsResponseDto> {
    return this.applicationService.getMyApplicationStats(userPayload);
  }

  @Get('me')
  @ApiOperation({ summary: 'Candidate: list my job applications (paginated)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ApplicationStatus,
    description: 'Filter by application status',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    type: PaginatedMyJobApplicationsResponseDto,
  })
  public async listMyApplications(
    @CurrentUser() userPayload: UserDocument,
    @Query() query: ListMyApplicationsQueryDto,
  ): Promise<PaginatedMyJobApplicationsResponseDto> {
    return this.applicationService.listMyApplications(userPayload, query);
  }

  @Get('me/:applicationId')
  @ApiOperation({
    summary: 'Candidate: get one of my applications (track status + job)',
  })
  @ApiParam({ name: 'applicationId', description: 'Job application id' })
  @ApiResponse({
    status: HttpStatus.OK,
    type: MyJobApplicationItemResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Application not found',
  })
  public async getMyApplicationById(
    @CurrentUser() userPayload: UserDocument,
    @Param('applicationId') applicationId: string,
  ): Promise<MyJobApplicationItemResponseDto> {
    return this.applicationService.getMyApplicationById(userPayload, applicationId);
  }

}