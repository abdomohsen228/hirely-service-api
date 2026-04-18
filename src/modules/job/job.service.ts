import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import { Hr, HrDocument } from 'src/database/schemas/hr.schema';
import { UserRole } from 'src/database/enums/userRole.enum';
import { CreateJobPostRequestDto } from './dtos/request/createJobPostRequest.dto';
import { JobPostResponseDto } from './dtos/response/jobPostResponse.dto';
import { User, UserDocument } from 'src/database/schemas/user.schema';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Hr.name) private readonly hrModel: Model<HrDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  public async createJobPost(
    user: UserDocument,
    dto: CreateJobPostRequestDto,
  ): Promise<JobPostResponseDto> {
    if (user.role !== UserRole.HR) {
      throw new ForbiddenException('Only HR users can create job posts');
    }

    const userDoc = await this.userModel.findById(user._id).exec();
    if (!userDoc?.email) {
      throw new ForbiddenException(
        'Complete HR registration before creating job posts',
      );
    }

    const emailLocalPart = userDoc.email.split('@')[0];
    const hrProfile = await this.hrModel
      .findOne({ username: emailLocalPart })
      .exec();
    if (!hrProfile) {
      throw new ForbiddenException(
        'Complete HR registration before creating job posts',
      );
    }

    if (dto.compensationMax < dto.compensationMin) {
      throw new BadRequestException(
        'compensationMax must be greater than or equal to compensationMin',
      );
    }

    const created = await this.jobModel.create({
      title: dto.title,
      department: dto.department,
      jobType: dto.jobType,
      location: dto.location,
      experienceLevel: dto.experienceLevel,
      compensationMin: dto.compensationMin,
      compensationMax: dto.compensationMax,
      roleContext: dto.roleContext,
      coreResponsibilities: dto.coreResponsibilities,
      skills: dto.skills,
      keywords: dto.keywords,
      interviewerQuestions: dto.interviewerQuestions ?? [],
      documentAttachment: dto.documentAttachment,
      companyName: hrProfile.companyName,
      createdBy: user._id,
    });

    return this.toResponse(created);
  }

  private toResponse(doc: JobDocument): JobPostResponseDto {
    return {
      id: doc._id.toString(),
      title: doc.title,
      department: doc.department,
      jobType: doc.jobType,
      location: doc.location,
      experienceLevel: doc.experienceLevel,
      compensationMin: doc.compensationMin,
      compensationMax: doc.compensationMax,
      roleContext: doc.roleContext,
      coreResponsibilities: doc.coreResponsibilities,
      skills: doc.skills ?? [],
      keywords: doc.keywords ?? [],
      interviewerQuestions: doc.interviewerQuestions ?? [],
      documentAttachment: doc.documentAttachment,
      companyName: doc.companyName,
      createdBy: doc.createdBy.toString(),
      status: doc.status,
      applicationCount: doc.applicationCount,
      createdAt: doc.get('createdAt'),
      updatedAt: doc.get('updatedAt'),
    };
  }
}
