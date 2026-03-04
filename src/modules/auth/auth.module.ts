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

@Module({
  controllers: [AuthController],
  providers: [AuthService, AuthGuard],
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Candidate.name, schema: CandidateSchema },
      { name: Hr.name, schema: HrSchema },
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
  exports: [JwtModule, AuthGuard],
})
export class AuthModule {}
