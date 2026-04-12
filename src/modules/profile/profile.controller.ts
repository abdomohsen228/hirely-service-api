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
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { CurrentUser } from 'src/decorators/currentPayload';
import { UserDocument } from 'src/database/schemas/user.schema';
import { ProfileService } from './profile.service';
import { UpdateProfileRequestDto } from './dtos/request/updateProfile.request.dto';
import { CreateEducationRequestDto } from './dtos/request/createEducation.request.dto';
import { UpdateEducationRequestDto } from './dtos/request/updateEducation.request.dto';
import { CreateExperienceRequestDto } from './dtos/request/createExperience.request.dto';
import { UpdateExperienceRequestDto } from './dtos/request/updateExperience.request.dto';
import { UpdateSkillsRequestDto } from './dtos/request/updateSkills.request.dto';
import { UpdateEqualEmploymentRequestDto } from './dtos/request/updateEqualEmployment.request.dto';
import { UpdateProfilePhotoRequestDto } from './dtos/request/updateProfilePhoto.request.dto';
import { ProfileResponseDto } from './dtos/response/profile.response.dto';
import { EducationEntryResponseDto } from './dtos/response/educationEntry.response.dto';
import { ExperienceEntryResponseDto } from './dtos/response/experienceEntry.response.dto';
import { DeleteSuccessResponseDto } from './dtos/response/deleteSuccess.response.dto';
import { SkillsPatchResponseDto } from './dtos/response/skillsPatch.response.dto';
import { EqualEmploymentPatchResponseDto } from './dtos/response/equalEmploymentPatch.response.dto';
import { PresignedUploadResponseDto } from './dtos/response/presignedUpload.response.dto';

@ApiTags('Profile')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  @ApiOperation({ summary: 'Get current candidate profile' })
  @ApiResponse({ status: HttpStatus.OK, type: ProfileResponseDto })
  getProfile(@CurrentUser() user: UserDocument) {
    return this.profileService.getProfile(user);
  }

  @Patch()
  @ApiOperation({ summary: 'Update profile fields (fullName, country, bio, …)' })
  @ApiResponse({ status: HttpStatus.OK, type: ProfileResponseDto })
  updateProfile(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateProfileRequestDto,
  ) {
    return this.profileService.updateProfile(user, dto);
  }

  @Patch('photo')
  @ApiOperation({
    summary: 'Change profile photo (presigned upload via Upload module)',
  })
  @ApiResponse({ status: HttpStatus.OK, type: PresignedUploadResponseDto })
  updateProfilePhoto(
    @CurrentUser() user: UserDocument,
    @Body() body: UpdateProfilePhotoRequestDto,
  ) {
    return this.profileService.updateProfilePhoto(user, body);
  }

  @Post('education')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add education entry' })
  @ApiResponse({ status: HttpStatus.CREATED, type: EducationEntryResponseDto })
  addEducation(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateEducationRequestDto,
  ) {
    return this.profileService.addEducation(user, dto);
  }

  @Patch('education/:id')
  @ApiOperation({ summary: 'Update education entry' })
  @ApiResponse({ status: HttpStatus.OK, type: EducationEntryResponseDto })
  updateEducation(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateEducationRequestDto,
  ) {
    return this.profileService.updateEducation(user, id, dto);
  }

  @Delete('education/:id')
  @ApiOperation({ summary: 'Delete education entry' })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteSuccessResponseDto })
  removeEducation(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.profileService.removeEducation(user, id);
  }

  @Post('experience')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add work experience entry' })
  @ApiResponse({ status: HttpStatus.CREATED, type: ExperienceEntryResponseDto })
  addExperience(
    @CurrentUser() user: UserDocument,
    @Body() dto: CreateExperienceRequestDto,
  ) {
    return this.profileService.addExperience(user, dto);
  }

  @Patch('experience/:id')
  @ApiOperation({ summary: 'Update work experience entry' })
  @ApiResponse({ status: HttpStatus.OK, type: ExperienceEntryResponseDto })
  updateExperience(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
    @Body() dto: UpdateExperienceRequestDto,
  ) {
    return this.profileService.updateExperience(user, id, dto);
  }

  @Delete('experience/:id')
  @ApiOperation({ summary: 'Delete work experience entry' })
  @ApiResponse({ status: HttpStatus.OK, type: DeleteSuccessResponseDto })
  removeExperience(
    @CurrentUser() user: UserDocument,
    @Param('id') id: string,
  ) {
    return this.profileService.removeExperience(user, id);
  }

  @Patch('skills')
  @ApiOperation({ summary: 'Replace all skills in one request' })
  @ApiResponse({ status: HttpStatus.OK, type: SkillsPatchResponseDto })
  updateSkills(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateSkillsRequestDto,
  ) {
    return this.profileService.updateSkills(user, dto);
  }

  @Patch('equal-employment')
  @ApiOperation({ summary: 'Update equal employment (EEO) information' })
  @ApiResponse({ status: HttpStatus.OK, type: EqualEmploymentPatchResponseDto })
  updateEqualEmployment(
    @CurrentUser() user: UserDocument,
    @Body() dto: UpdateEqualEmploymentRequestDto,
  ) {
    return this.profileService.updateEqualEmployment(user, dto);
  }
}
