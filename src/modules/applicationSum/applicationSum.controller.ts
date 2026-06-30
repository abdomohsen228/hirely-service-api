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
  Put,
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
import { ApplicationSumService } from './applicationSum.service';
import { ApplicationSumResponseDto } from './dto/response/ApplicationSumResponse.dto';
import { RecruiterNotesSectionDto } from './dto/response/RecruiterNotesSection.dto';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';

@ApiTags('ApplicationsSum')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller(':applicationId/ApplicationSum')
export class ApplicationSumController {
  constructor(private readonly applicationSumService: ApplicationSumService) {}

  @Get()
  @ApiOperation({ summary: 'Get Application data' })
  @ApiParam({ name: 'applicationId', description: 'ID of the application' })
  @ApiResponse({
    status: 200,
    description: 'Application data retrieved successfully',
    type: ApplicationSumResponseDto,
  })
  public async getApplicationSum(
    @CurrentUser() userPayload: UserDocument,
    @Param('applicationId') applicationId: string,
  ): Promise<ApplicationSumResponseDto> {
    return this.applicationSumService.getApplicationSum(userPayload, applicationId);
  }

  // send email

  //crud notes
  @Post('/notes')
  @ApiOperation({ summary: 'Add New Application Note' })
  @ApiParam({ name: 'applicationId', description: 'ID of the application' })
  @ApiResponse({
    status: 201,
    description: 'New note created successfuly',
    type: ApplicationSumResponseDto,
  })
  public async addNotes(
    @CurrentUser() userPayload: UserDocument,
    @Param('applicationId') applicationId: string,
    @Body() notes: RecruiterNotesSectionDto
  ): Promise<RecruiterNotesSectionDto> {
    return this.applicationSumService.addNotes(userPayload, applicationId, notes);
  }

  @Delete('/notes/:id')
  @ApiOperation({ summary: 'Delete Note' })
  @ApiParam({ name: 'applicationId', description: 'ID of the application' })
  @ApiParam({ name: 'NoteId', description: 'ID of the note' })
  @ApiResponse({
    status: 204,
    description: 'No content',
  })
  public async deleteNotes(
    @CurrentUser() userPayload: UserDocument,
    @Param('applicationId') applicationId: string,
    @Param('noteId') noteId: string,
  ){
    return this.applicationSumService.deleteNote(userPayload, applicationId, noteId);
  }

  @Put('/notes/:id')
  @ApiOperation({ summary: 'update Note' })
  @ApiParam({ name: 'applicationId', description: 'ID of the application' })
  @ApiParam({ name: 'NoteId', description: 'ID of the note' })
  @ApiResponse({
    status: 200,
    description: 'Note updated successfuly',
  })
  public async updateNote(
    @CurrentUser() userPayload: UserDocument,
    @Param('applicationId') applicationId: string,
    @Param('noteId') noteId: string,
    @Body() noteBody:string
  ){
    return this.applicationSumService.updateNote(userPayload, applicationId, noteId, noteBody);
  }


  //change status
  @Put('/applicationStatus')
  @ApiOperation({ summary: 'update application State' })
  @ApiParam({ name: 'applicationId', description: 'ID of the application' })
  @ApiResponse({
    status: 200,
    description: 'Candidate state updated successfuly',
  })
  public async updateStatus(
    @CurrentUser() userPayload: UserDocument,
    @Param('applicationId') applicationId: string,
    @Body() applicationStatus:ApplicationStatus
  ){
    return this.applicationSumService.updateStatus(userPayload, applicationId,applicationStatus);
  }
  
}
