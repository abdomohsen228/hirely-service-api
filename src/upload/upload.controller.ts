import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { UseGuards } from '@nestjs/common';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('video')
  createVideoUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createVideoUploadUrl({
      userId: req.user?.id?.tostring(),
      fileName: body.fileName,
      contentType: body.contentType,
      role: req.user.role || 'candidate'
    });
  }

  @Post('image')
  @UseGuards(AuthGuard)
  createImageUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createProfilePictureUploadUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType
    });
  }

  @Post('cv')
  createCvUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createCvUploadUrl({
      userId: req.user?._id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType
    });
  }

  @Get('test')
  testS3Connection() {
    return this.uploadService.testConnection();
  }
}
