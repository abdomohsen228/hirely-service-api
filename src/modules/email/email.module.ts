import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { UploadModule } from 'src/upload/upload.module';

@Module({
  imports: [ConfigModule, UploadModule],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
