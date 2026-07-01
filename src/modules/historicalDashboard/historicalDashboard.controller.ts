import { ApiTags, ApiParam, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UseGuards, Controller, Get } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/auth.guards";
import { HistoricalDashboardService } from "./historicalDashboard.service";
import { CurrentUser } from "src/decorators/currentPayload";
import { Param, Query, Res } from "@nestjs/common";
import { UserDocument } from "src/database/schemas/user.schema";
import { HistoricalDashboardRequestDto } from "./dtos/request/HistoricalDashboardRequest.dto";
import { HistoricalDashboardResponseDto } from "./dtos/response/HistoricalDashboardResponse.dto";
import { Response } from "express";
@ApiTags('HistoricalDashboard')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('historicalDashboard')
export class HistoricalDashboardController {
    constructor( private readonly historicalDashboardService: HistoricalDashboardService){ }

    // get Dashboard
    @Get()
    @ApiOperation({ summary: 'Get Historical dashboard data' })
    @ApiParam({ name: 'jobId', description: 'ID of the job post' })
    @ApiResponse({
    status: 200,
    description: 'Historical dashboard data retrieved successfully',
    type: HistoricalDashboardResponseDto,
    })
    public async getHistoricalashboard(
    @CurrentUser() userPayload: UserDocument,
    @Query() query: HistoricalDashboardRequestDto
    ): Promise<HistoricalDashboardResponseDto> {
    return this.historicalDashboardService.getDashboard( userPayload, query);
    }

    // get all open jobs



    // export dashboard as pdf, csv, xlsx
    // @Get('export')
    //   @ApiOperation({ summary: 'Export job dashboard data as CSV or Excel' })
    //   @ApiParam({ name: 'jobId', description: 'ID of the job post' })
    //   @ApiResponse({
    //     status: 200,
    //     description: 'Job dashboard data exported successfully',
    //     type: Response,
    //   })
    //   public async exportDashboardData(
    //     @CurrentUser() userPayload: UserDocument,
    //     @Query() query: jobDasboardExportRequestDto,
    //     @Res() res: Response,
    //   ) {
    //     return this.jobDashboardService.exportDashboardData(userPayload, jobId, query, res);
    //   }


    
}


