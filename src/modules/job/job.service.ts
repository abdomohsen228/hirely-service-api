import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Job, JobDocument } from 'src/database/schemas/jobs.schema';
import { Hr, HrDocument } from 'src/database/schemas/hr.schema';
import { UserRole } from 'src/database/enums/userRole.enum';
import { CreateJobPostRequestDto } from './dtos/request/createJobPostRequest.dto';
import { ListJobPostsQueryDto } from './dtos/request/listJobPostsQuery.dto';
import { UpdateJobPostRequestDto } from './dtos/request/updateJobPostRequest.dto';
import { JobPostResponseDto } from './dtos/response/jobPostResponse.dto';
import { PaginatedJobListResponseDto } from './dtos/response/paginatedJobListResponse.dto';
import { User, UserDocument } from 'src/database/schemas/user.schema';

@Injectable()
export class JobService {
  constructor(
    @InjectModel(Job.name) private readonly jobModel: Model<JobDocument>,
    @InjectModel(Hr.name) private readonly hrModel: Model<HrDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
  ) {}

  private assertHrUser(user: UserDocument): void {
    if (user.role !== UserRole.HR) {
      throw new ForbiddenException('Only HR users can manage job posts');
    }
  }

  private parseJobObjectId(id: string): Types.ObjectId {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid job id');
    }
    return new Types.ObjectId(id);
  }

  public async createJobPost(
    user: UserDocument,
    dto: CreateJobPostRequestDto,
  ): Promise<JobPostResponseDto> {
    this.assertHrUser(user);

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

  public async listJobPosts(
    user: UserDocument,
    query: ListJobPostsQueryDto,
  ): Promise<PaginatedJobListResponseDto> {
    this.assertHrUser(user);

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;
    const filter = { createdBy: user._id };

    const [docs, total] = await Promise.all([
      this.jobModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.jobModel.countDocuments(filter).exec(),
    ]);

    return {
      items: docs.map((d) => this.toResponse(d)),
      total,
      page,
      limit,
      totalPages: total === 0 ? 0 : Math.ceil(total / limit),
    };
  }

  public async getJobPostById(
    user: UserDocument,
    id: string,
  ): Promise<JobPostResponseDto> {
    this.assertHrUser(user);
    const jobId = this.parseJobObjectId(id);
    const doc = await this.jobModel
      .findOne({ _id: jobId, createdBy: user._id })
      .exec();
    if (!doc) {
      throw new NotFoundException('Job not found');
    }
    return this.toResponse(doc);
  }

  public async updateJobPost(
    user: UserDocument,
    id: string,
    dto: UpdateJobPostRequestDto,
  ): Promise<JobPostResponseDto> {
    this.assertHrUser(user);
    const jobId = this.parseJobObjectId(id);
    const doc = await this.jobModel
      .findOne({ _id: jobId, createdBy: user._id })
      .exec();
    if (!doc) {
      throw new NotFoundException('Job not found');
    }

    const nextMin = dto.compensationMin ?? doc.compensationMin;
    const nextMax = dto.compensationMax ?? doc.compensationMax;
    if (nextMax < nextMin) {
      throw new BadRequestException(
        'compensationMax must be greater than or equal to compensationMin',
      );
    }

    const assignableKeys: (keyof UpdateJobPostRequestDto)[] = [
      'title',
      'department',
      'jobType',
      'location',
      'experienceLevel',
      'compensationMin',
      'compensationMax',
      'roleContext',
      'coreResponsibilities',
      'skills',
      'keywords',
      'interviewerQuestions',
      'documentAttachment',
    ];

    for (const key of assignableKeys) {
      const value = dto[key];
      if (value !== undefined) {
        (doc as unknown as Record<string, unknown>)[key] = value;
      }
    }

    await doc.save();
    return this.toResponse(doc);
  }

  public async deleteJobPost(user: UserDocument, id: string): Promise<void> {
    this.assertHrUser(user);
    const jobId = this.parseJobObjectId(id);
    const result = await this.jobModel
      .deleteOne({ _id: jobId, createdBy: user._id })
      .exec();
    if (result.deletedCount === 0) {
      throw new NotFoundException('Job not found');
    }
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
