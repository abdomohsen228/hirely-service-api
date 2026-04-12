import { Body, Controller, Get, HttpStatus, Patch, UseGuards } from '@nestjs/common';
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
import { UpdateProfilePhotoRequestDto } from './dtos/request/updateProfilePhoto.request.dto';
import { ProfileResponseDto } from './dtos/response/profile.response.dto';
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
  @ApiOperation({
    summary:
      'Update profile (basic fields, skills, educations, experiences, equal employment). Omitted fields unchanged; sent arrays replace the full list.',
  })
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
}
