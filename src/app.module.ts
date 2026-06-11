import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { JobModule } from './modules/job/job.module';
import { UploadModule } from './upload/upload.module';
import awsConfig from './config/aws.config';
// import { BullModule } from '@nestjs/bullmq';
import { ProfileModule } from './modules/profile/profile.module';
import { AiMatchingModule } from './modules/ai-matching/ai-matching.module';
import { EmailModule } from './modules/email/email.module';
import { JobDashboardModule } from './modules/jobDashboard/jobDashboard.module';
import { ExportModule } from './modules/export/export.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.NODE_ENV !== 'production' ? '.env' : undefined,
      load: [awsConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbUrl = configService.get<string>('DATABASE_URL');
        if (!dbUrl) {
          throw new Error('DATABASE_URL is not defined');
        }
        return { uri: dbUrl };
      },
    }),
    AuthModule,
    UploadModule,
    ProfileModule,
    EmailModule,
    JobDashboardModule,
    ExportModule,
    // BullModule.forRoot({
    //   connection: {
    //     host: process.env.REDIS_HOST,
    //     port: parseInt(process.env.REDIS_PORT || '6379', 10),
    //     username: process.env.REDIS_USERNAME,
    // //     password: process.env.REDIS_PASSWORD,
    //     tls: {},
    //   },
    //   defaultJobOptions: {
    //     removeOnComplete: true,
    //     removeOnFail: true,
    //     attempts: 3,
    //     backoff: {
    //       type: 'exponential',
    //       delay: 5000,
    //     },
    //   },
    // }),
    JobModule,
    AiMatchingModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
