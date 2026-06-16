import { ApiTags, ApiParam, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UseGuards, Controller, Get } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/auth.guards";
import { HistoricalDashboardService } from "./historicalDashboard.service";
import { CurrentUser } from "src/decorators/currentPayload";
import { Param, Query } from "@nestjs/common";
import { UserDocument } from "src/database/schemas/user.schema";
@ApiTags('HistoricalDashboard')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('historicalDashboard')
export class HistoricalDashboardController {
    constructor( private readonly historicalDashboardService: HistoricalDashboardService){ }

    // @Get()
    // @ApiOperation({ summary: 'Get Historical dashboard data' })
    // @ApiParam({ name: 'jobId', description: 'ID of the job post' })
    // @ApiResponse({
    // status: 200,
    // description: 'Job dashboard data retrieved successfully',
    // type: HistoricalDashboardResponseDto,
    // })
    // public async getJobDashboard(
    // @CurrentUser() userPayload: UserDocument,
    // @Param('jobId') jobId: string,
    // @Query() query: HistoricalDashboardRequestDto
    // ): Promise<HistoricalDashboardResponseDto> {
    // return this.jobDashboardService.getHistoricalDashboard( userPayload,jobId, query);
    // }
    
}


