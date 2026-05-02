import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Candidate,
  CandidateSchema,
} from 'src/database/schemas/candidate.schema';
import { Hr, HrSchema } from 'src/database/schemas/hr.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
import { UploadModule } from 'src/upload/upload.module';
import { ProfileController } from './profile.controller';
import { ProfileService } from './profile.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Candidate.name, schema: CandidateSchema },
      { name: Hr.name, schema: HrSchema },
    ]),
    AuthModule,
    UploadModule,
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
