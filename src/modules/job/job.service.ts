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
import { UserDocument } from 'src/database/schemas/user.schema';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Hr.name) private readonly hrModel: Model<HrDocument>,
  ) {}

  public async createJobPost(
    user: UserDocument,
    dto: CreateJobPostRequestDto,
  ): Promise<JobPostResponseDto> {
    if (user.role !== UserRole.HR) {
      throw new ForbiddenException('Only HR users can create job posts');
    }

    const hr = await this.hrModel.findOne({ email: user.email }).exec();
    if (!hr) {
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
      documentAttachment: dto.documentAttachment,
      companyName: hr.companyName,
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
