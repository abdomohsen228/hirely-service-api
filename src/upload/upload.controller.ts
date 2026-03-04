import { Body, Controller, Post, Req } from '@nestjs/common';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('video')
  createVideoUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createVideoUploadUrl({
    userId:req.user.id,
    fileName: body.fileName,
    contentType: body.contentType,
    role: req.user.role || 'candidate'
    });
  }

  @Post('image')
  createImageUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createProfilePictureUploadUrl({
      userId:req.user.id,
      fileName: body.fileName,
      contentType: body.contentType
    });
  }

  @Post('cv')
  createCvUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createCvUploadUrl({
      userId:req.user.id,
      fileName: body.fileName,
      contentType: body.contentType
    });
  }
}
