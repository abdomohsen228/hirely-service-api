import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthGuard } from './guards/auth.guards';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { Hr, HrSchema } from 'src/database/schemas/hr.schema';
import {
  Candidate,
  CandidateSchema,
} from 'src/database/schemas/candidate.schema';
import { GoogleStrategy } from './strategies/google.strategy';
import { AiMatchingModule } from '../ai-matching/ai-matching.module';
import {
  UserJobScore,
  UserJobScoreSchema,
} from 'src/database/schemas/user_job_score.schema';

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard, GoogleStrategy],
  imports: [
    ConfigModule,
    AiMatchingModule,

    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Hr.name, schema: HrSchema },
      { name: UserJobScore.name, schema: UserJobScoreSchema },
    ]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (config: ConfigService): JwtModuleOptions => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: Number(config.get<string>('JWT_EXPIRATION')),
        },
      }),
    }),
  ],
  exports: [JwtModule, AuthGuard, MongooseModule],
})
export class AuthModule {}
