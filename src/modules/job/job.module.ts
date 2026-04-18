import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from 'src/database/schemas/jobs.schema';
import { Hr, HrSchema } from 'src/database/schemas/hr.schema';
import { User, UserSchema } from 'src/database/schemas/user.schema';
import { AuthModule } from 'src/modules/auth/auth.module';
import { JobController } from './job.controller';
import { JobService } from './job.service';

@Module({
  imports: [
    AuthModule,
    MongooseModule.forFeature([
      { name: Job.name, schema: JobSchema },
      { name: Hr.name, schema: HrSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [JobController],
  providers: [JobService],
  exports: [JobService],
})
export class JobModule {}
