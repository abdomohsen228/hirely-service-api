import { Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { AuthGuard } from 'src/modules/auth/guards/auth.guards';
import { UseGuards } from '@nestjs/common';
import { ImageUploadDto } from './dtos/imageUpload.dto';
// import { UploadProducer } from 'src/queues/upload-queue/producer/upload.producer';
@ApiTags('Upload')
@ApiBearerAuth('access-token')
@UseGuards(AuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    // private readonly uploadProducer: UploadProducer,
  ) {}

  @Post('video')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create video upload URL' })
  @ApiResponse({ status: 201, description: 'Returns the created video upload URL' })
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
  @ApiOperation({ summary: 'Get video upload URL' })
  @ApiParam({ name: 'applicationId', description: 'The ID of the application' })
  @ApiParam({ name: 'order', description: 'The order of the video' })
  @ApiResponse({ status: 200, description: 'Returns the video upload URL' })
  getVideoUrl(@Req() req: any, @Param('applicationId') applicationId:string,@Param('order') order:number) {
    return this.uploadService.getVideoUrl(applicationId,order);
  }

  @Post('image')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create image upload URL' })
  @ApiResponse({ status: 201, description: 'Returns the created image upload URL' })
  createImageUpload(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.createProfilePictureUploadUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
    });
  }

  @Post('cv')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Create CV upload URL' })
  @ApiResponse({ status: 201, description: 'Returns the created CV upload URL' })
  createCvUpload(@Req() req: any, @Body() body: any) {
    return this.uploadService.createCvUploadUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
    });
  }

  @Get('image/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get profile picture URL' })
  @ApiParam({ name: 'id', description: 'The ID of the profile picture' })
  @ApiResponse({ status: 200, description: 'Returns the profile picture URL' })
  async getProfilePictureUrl(@Req() req: any, @Param('id') id: string) {
    return this.uploadService.getProfilePictureUrl(id);
  }

  @Get('cv/:id')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get CV URL' })
  @ApiParam({ name: 'id', description: 'The ID of the CV' })
  @ApiResponse({ status: 200, description: 'Returns the CV URL' })
  async getCvUrl(@Req() req: any, @Param('id') id: string) {
    return this.uploadService.getCvUrl(id);
  }

  @Put('image')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update profile picture URL' })
  @ApiResponse({ status: 200, description: 'Returns the updated profile picture URL' })
  async updateProfilePicture(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.updateProfilePictureUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
    });
  }

  @Put('cv')
  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Update CV URL' })
  @ApiResponse({ status: 200, description: 'Returns the updated CV URL' })
  async updateCv(@Req() req: any, @Body() body: ImageUploadDto) {
    return this.uploadService.updateCvUrl({
      userId: req.user?.id?.toString(),
      fileName: body.fileName,
      contentType: body.contentType,
    });
  }

  @Get('logo')
  async getLogoUrl() {
    return this.uploadService.getLogoUrl();
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
