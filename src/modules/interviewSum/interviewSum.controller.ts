import { ApiTags, ApiParam, ApiResponse, ApiOperation } from "@nestjs/swagger";
import { ApiBearerAuth } from "@nestjs/swagger";
import { UseGuards, Controller, Get } from "@nestjs/common";
import { AuthGuard } from "../auth/guards/auth.guards";
import { CurrentUser } from "src/decorators/currentPayload";
import { Param, Query, Res } from "@nestjs/common";
import { UserDocument } from "src/database/schemas/user.schema";
import { Response } from "express";
import { InterviewSumResponseDto } from "./dto/response/interviewSumResponse.dto";
import { InterviewSumService } from "./interviewSum.service";
@ApiTags('InterviewSummary')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller(':applicationId/interviewSummary')
export class InterviewSumController {
    constructor( private readonly interviewSumService: InterviewSumService){ }

    @Get()
    @ApiOperation({ summary: 'Get Interview Summary for application' })
    @ApiParam({ name: 'applicationId', description: 'ID of the application interviewed' })
    @ApiResponse({
    status: 200,
    description: 'Interview Summary retrieved Successfully',
    type: InterviewSumResponseDto,
    })
    public async getInterviewSummary(
    @CurrentUser() userPayload: UserDocument,
    @Param() applicationId: string
    ): Promise<InterviewSumResponseDto> {
    return this.interviewSumService.getInterviewSum( userPayload, applicationId);
    }



}


