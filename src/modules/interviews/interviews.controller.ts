import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CurrentUser } from 'src/decorators/currentPayload';
import { UserDocument } from 'src/database/schemas/user.schema';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { CreateInterviewUploadUrlRequestDto } from './dtos/request/createInterviewUploadUrlRequest.dto';
import { SaveInterviewAnswerRequestDto } from './dtos/request/saveInterviewAnswerRequest.dto';
import { InterviewAnswerResponseDto } from './dtos/response/interviewAnswerResponse.dto';
import { InterviewSessionResponseDto } from './dtos/response/interviewSessionResponse.dto';
import { InterviewUploadUrlResponseDto } from './dtos/response/interviewUploadUrlResponse.dto';
import { InterviewsService } from './interviews.service';
import { InterviewInstructionsResponseDto } from './dtos/response/interviewInstructionsResponse.dto';

@ApiTags('Interviews')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller()
export class InterviewsController {
  constructor(private readonly interviewsService: InterviewsService) {}

  @Get('/instructions')
  @ApiOperation({ summary: 'Candidate: get interview instructions' })
  @ApiResponse({ type: InterviewInstructionsResponseDto })
  public async getInterviewInstructions(
    @CurrentUser() user: UserDocument,
  ): Promise<InterviewInstructionsResponseDto> {
    return this.interviewsService.getInterviewInstructions(user);
  }

  @Get('/test')
  @ApiOperation({ summary: 'Candidate: get test interview sample' })
  @ApiResponse({ type: InterviewInstructionsResponseDto })
  public async getInterviewTest(
    @CurrentUser() user: UserDocument,
  ): Promise<InterviewInstructionsResponseDto> {
    return this.interviewsService.getInterviewInstructions(user);
  }

  @Get('applications/me/:applicationId/interview')
  @ApiOperation({ summary: 'Candidate: get interview session for an application' })
  @ApiParam({ name: 'applicationId', description: 'Application id' })
  @ApiResponse({ type: InterviewSessionResponseDto })
  public async getApplicationInterview(
    @CurrentUser() user: UserDocument,
    @Param('applicationId') applicationId: string,
  ): Promise<InterviewSessionResponseDto> {
    return this.interviewsService.getApplicationInterview(user, applicationId);
  }

  @Post('applications/me/:applicationId/interview/start')
  @ApiOperation({ summary: 'Candidate: start interview for an application' })
  @ApiParam({ name: 'applicationId', description: 'Application id' })
  @ApiResponse({ type: InterviewSessionResponseDto })
  public async startApplicationInterview(
    @CurrentUser() user: UserDocument,
    @Param('applicationId') applicationId: string,
  ): Promise<InterviewSessionResponseDto> {
    return this.interviewsService.startApplicationInterview(user, applicationId);
  }

  @Post('interviews/:interviewId/questions/:questionId/upload-url')
  @ApiOperation({ summary: 'Candidate: create upload URL for an answer video' })
  @ApiParam({ name: 'interviewId', description: 'Interview id' })
  @ApiParam({ name: 'questionId', description: 'Question id' })
  @ApiBody({ type: CreateInterviewUploadUrlRequestDto })
  @ApiResponse({ type: InterviewUploadUrlResponseDto })
  public async createQuestionUploadUrl(
    @CurrentUser() user: UserDocument,
    @Param('interviewId') interviewId: string,
    @Param('questionId') questionId: string,
    @Body() dto: CreateInterviewUploadUrlRequestDto,
  ): Promise<InterviewUploadUrlResponseDto> {
    return this.interviewsService.createQuestionUploadUrl(
      user,
      interviewId,
      questionId,
      dto,
    );
  }

  @Post('interviews/:interviewId/answers')
  @ApiOperation({ summary: 'Candidate: save or replace an interview answer' })
  @ApiParam({ name: 'interviewId', description: 'Interview id' })
  @ApiBody({ type: SaveInterviewAnswerRequestDto })
  @ApiResponse({ type: InterviewAnswerResponseDto })
  public async saveAnswer(
    @CurrentUser() user: UserDocument,
    @Param('interviewId') interviewId: string,
    @Body() dto: SaveInterviewAnswerRequestDto,
  ): Promise<InterviewAnswerResponseDto> {
    return this.interviewsService.saveAnswer(user, interviewId, dto);
  }

  @Post('interviews/:interviewId/submit')
  @ApiOperation({ summary: 'Candidate: submit completed interview' })
  @ApiParam({ name: 'interviewId', description: 'Interview id' })
  @ApiResponse({ type: InterviewSessionResponseDto })
  public async submitInterview(
    @CurrentUser() user: UserDocument,
    @Param('interviewId') interviewId: string,
  ): Promise<InterviewSessionResponseDto> {
    return this.interviewsService.submitInterview(user, interviewId);
  }
}
