import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { UseGuards } from '@nestjs/common';
import { ImageUploadDto } from './dtos/imageUpload.dto';
// import { UploadProducer } from 'src/queues/upload-queue/producer/upload.producer';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    // private readonly uploadProducer: UploadProducer,
  ) {}

  @Post('video')
  @UseGuards(AuthGuard)
  createVideoUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createVideoUploadUrl({
      userId: req.user?.id?.tostring(),
      fileName: body.fileName,
      contentType: body.contentType,
      role: req.user.role,
      order: body.order,
      application: body.application
    });
  }

  @Get('video')
  @UseGuards(AuthGuard)
  getVideoUrl(@Req() req: any, @Param('applicationId') applicationId:string,@Param('order') order:number) {
    return this.uploadService.getVideoUrl(applicationId,order);
  }

  @Post('image')
  @UseGuards(AuthGuard)
  createImageUpload(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.createProfilePictureUploadUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
    });
  }

  @Post('cv')
  @UseGuards(AuthGuard)
  createCvUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createCvUploadUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
    });
  }

  @Get('image/:id')
  @UseGuards(AuthGuard)
  async getProfilePictureUrl(@Req() req: any, @Param('id') id: string) {
    return this.uploadService.getProfilePictureUrl(id);
  }

  @Get('cv/:id')
  @UseGuards(AuthGuard)
  async getCvUrl(@Req() req: any, @Param('id') id: string) {
    return this.uploadService.getCvUrl(id);
  }

  @Put('image')
  @UseGuards(AuthGuard)
  async updateProfilePicture(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.updateProfilePictureUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
    });
  }

  @Put('cv')
  @UseGuards(AuthGuard)
  async updateCv(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.updateCvUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
    });
  }

  // @Get('test')
  // testS3Connection() {
  //   return this.uploadService.testConnection();
  // }

  // @Post('test-queue')
  // testQueue(@Req() req: any, @Body() body: any) {
  //   return this.uploadProducer.validateUpload({
  //     key: body.key,
  //     status: body.status,
  //     type: 'image',
  //     reason: body.reason
  //   });
  // }
}
