import { Body, Controller, Get, Post, Put, Req } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { UseGuards } from '@nestjs/common';
import { ImageUploadDto } from './dtos/imageUpload.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('video')
  createVideoUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createVideoUploadUrl({
      userId: req.user?.id?.tostring(),
      fileName: body.fileName,
      contentType: body.contentType,
      role: req.user.role
    });
  }

  @Post('image')
  @UseGuards(AuthGuard)
  createImageUpload(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.createProfilePictureUploadUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
      filesize: body.filesize
    });
  }

  @Post('cv')
  @UseGuards(AuthGuard)
  createCvUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createCvUploadUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
      filesize: body.filesize
    });
  }

  @Get('image')
  @UseGuards(AuthGuard)
  async getProfilePictureUrl(@Req() req: any) {
    return this.uploadService.getProfilePictureUrl(req.user?.id?.toString());
  }

  @Get('cv')
  @UseGuards(AuthGuard)
  async getCvUrl(@Req() req: any) {
    return this.uploadService.getCvUrl(req.user?.id?.toString());
  }

  @Put('image')
  @UseGuards(AuthGuard)
  async updateProfilePicture(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.updateProfilePictureUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
      filesize: body.filesize
    });
  }

  @Put('cv')
  @UseGuards(AuthGuard)
  async updateCv(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.updateCvUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
      filesize: body.filesize
    });
  }

  @Get('test')
  testS3Connection() {
    return this.uploadService.testConnection();
  }
}
