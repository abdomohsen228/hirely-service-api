import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserRole } from 'src/database/enums/userRole.enum';
import {
  Candidate,
  CandidateDocument,
  CandidateEducationEmbedded,
  CandidateExperienceEmbedded,
} from 'src/database/schemas/candidate.schema';
import { Hr, HrDocument } from 'src/database/schemas/hr.schema';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';
import { createValidatedResponse } from './dtos/create-validated-response';
import { UpdateHrProfileRequestDto } from './dtos/request/updateHrProfile.request.dto';
import { UpdateProfileRequestDto } from './dtos/request/updateProfile.request.dto';
import { UpdateProfilePhotoRequestDto } from './dtos/request/updateProfilePhoto.request.dto';
import { PresignedUploadResponseDto } from './dtos/response/presignedUpload.response.dto';
import { buildHrProfileResponse, buildProfileResponse } from './profile.mapper';
import { PictureCVStatus } from 'src/database/enums/pictureCVstatus.enum';
import {BadRequestException} from '@nestjs/common/exceptions';

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    @InjectModel(Hr.name) private readonly hrModel: Model<HrDocument>,
    private readonly uploadService: UploadService,
  ) {}

  private ensureCandidateRole(user: UserDocument): void {
    if (user.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException('Only candidates can access this profile');
    }
  }

  private ensureHrRole(user: UserDocument): void {
    if (user.role !== UserRole.HR) {
      throw new ForbiddenException('Only HR can access this profile');
    }
  }

  private async getHrForUser(user: UserDocument): Promise<HrDocument> {
    this.ensureHrRole(user);
    const emailPrefix = user.email.split('@')[0];
    const hr = await this.hrModel.findOne({ username: emailPrefix });
    if (!hr) {
      throw new NotFoundException(
        'HR profile not found. Complete registration first.',
      );
    }
    return hr;
  }

  private async getCandidateForUser(
    user: UserDocument,
  ): Promise<CandidateDocument> {
    this.ensureCandidateRole(user);
    let candidate = await this.candidateModel.findOne({ user: user._id });
    if (!candidate) {
      const legacyUsername = user.email.split('@')[0];
      candidate = await this.candidateModel.findOne({
        username: legacyUsername,
      });
      if (candidate) {
        if (candidate.user && !candidate.user.equals(user._id)) {
          throw new ForbiddenException(
            'This candidate profile is linked to another account',
          );
        }
        if (!candidate.user) {
          candidate.user = user._id;
          await candidate.save();
        }
      }
    }
    if (!candidate) {
      throw new NotFoundException(
        'Candidate profile not found. Complete registration first.',
      );
    }
    return candidate;
  }

  async getProfile(user: UserDocument) {
    const candidate = await this.getCandidateForUser(user);
    if(user.profilePictureStatus === 'approved' ) { 
      user.profilePictureUrl = await this.uploadService.getProfilePictureUrl(user.id);
      if(user.cvStatus === 'approved') {
        candidate.cvFileUrl = await this.uploadService.getCvUrl(user.id);
      }
    }
    else if(user.cvStatus === 'approved') {
      candidate.cvFileUrl = await this.uploadService.getCvUrl(user.id);
    }
    return buildProfileResponse(user, candidate);
  }

  async getHrProfile(user: UserDocument) {
    const hr = await this.getHrForUser(user);
    if(user.profilePictureStatus === 'approved' ) {
      hr.profilePictureUrl = await this.uploadService.getProfilePictureUrl(user.id);
      if(hr.cvStatus === 'approved') {
        hr.cvUrl = await this.uploadService.getCvUrl(user.id);
      }
    }
    else if(user.cvStatus === 'approved') {
      hr.cvUrl = await this.uploadService.getCvUrl(user.id);
    }
    return buildHrProfileResponse(user, hr);
  }

  async updateHrProfile(user: UserDocument, dto: UpdateHrProfileRequestDto) {
    const hr = await this.getHrForUser(user);
    const {
      fullName,
      phoneNumber,
      companyName,
      companyWebsite,
      companySummary,
      companySize,
      companyIndustry,
      jobTitle,
    } = dto;

    if (fullName !== undefined) hr.fullName = fullName;
    if (phoneNumber !== undefined) hr.phoneNumber = phoneNumber;
    if (companyName !== undefined) hr.companyName = companyName;
    if (companyWebsite !== undefined) hr.companyWebsite = companyWebsite;
    if (companySummary !== undefined) hr.companySummary = companySummary;
    if (companySize !== undefined) hr.companySize = companySize;
    if (companyIndustry !== undefined) hr.companyIndustry = companyIndustry;
    if (jobTitle !== undefined) hr.jobTitle = jobTitle;

    await hr.save();
    return buildHrProfileResponse(user, hr);
  }

  async updateProfile(user: UserDocument, dto: UpdateProfileRequestDto) {
    const candidate = await this.getCandidateForUser(user);
    const {
      bio,
      profileSummary,
      fullName,
      country,
      experienceLevel,
      yearsOfExperience,
      languages,
      currentJobTitle,
      linkedInUrl,
      githubUrl,
      mobileNumber,
      skills,
      educations,
      experiences,
      equalEmployment,
    } = dto;

    if (fullName !== undefined) candidate.fullName = fullName;
    if (country !== undefined) candidate.country = country;
    if (bio !== undefined) candidate.profileSummary = bio;
    else if (profileSummary !== undefined)
      candidate.profileSummary = profileSummary;
    if (experienceLevel !== undefined)
      candidate.experienceLevel = experienceLevel;
    if (yearsOfExperience !== undefined)
      candidate.yearsOfExperience = yearsOfExperience;
    if (languages !== undefined) candidate.languages = languages;
    if (currentJobTitle !== undefined)
      candidate.currentJobTitle = currentJobTitle;
    if (linkedInUrl !== undefined) candidate.linkedInUrl = linkedInUrl;
    if (githubUrl !== undefined) candidate.githubUrl = githubUrl;
    if (mobileNumber !== undefined) candidate.mobileNumber = mobileNumber;

    if (skills !== undefined) {
      candidate.skills = skills;
    }

    if (educations !== undefined) {
      candidate.educations = educations.map(
        (item): CandidateEducationEmbedded => ({
          _id: item.id ? new Types.ObjectId(item.id) : new Types.ObjectId(),
          institution: item.institution,
          degree: item.degree,
          fieldOfStudy: item.fieldOfStudy,
          startDate: item.startDate ? new Date(item.startDate) : undefined,
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          description: item.description,
        }),
      );
      candidate.markModified('educations');
    }

    if (experiences !== undefined) {
      candidate.experiences = experiences.map(
        (item): CandidateExperienceEmbedded => ({
          _id: item.id ? new Types.ObjectId(item.id) : new Types.ObjectId(),
          jobTitle: item.jobTitle,
          companyName: item.companyName,
          location: item.location,
          startDate: item.startDate ? new Date(item.startDate) : undefined,
          endDate: item.endDate ? new Date(item.endDate) : undefined,
          description: item.description,
          isCurrent: item.isCurrent ?? false,
        }),
      );
      candidate.markModified('experiences');
    }

    if (equalEmployment !== undefined) {
      const patch = Object.fromEntries(
        Object.entries(equalEmployment).filter(
          ([, v]) => v !== undefined && v !== null,
        ),
      ) as Record<string, string>;
      candidate.equalEmployment = {
        ...candidate.equalEmployment,
        ...patch,
      };
    }

    await candidate.save();
    return buildProfileResponse(user, candidate);
  }

  async updateProfilePhoto(
    user: UserDocument,
    body: UpdateProfilePhotoRequestDto,
  ) {
    this.ensureCandidateRole(user);
    if(user.profilePictureStatus != 'approved' ) {
      const raw = await this.uploadService.createProfilePictureUploadUrl({
        userId: user.id,
        fileName: body.fileName,
        contentType: body.contentType,
      });
      return createValidatedResponse(PresignedUploadResponseDto, raw);
    }
    const raw = await this.uploadService.updateProfilePictureUrl({
      userId: user.id,
      fileName: body.fileName,
      contentType: body.contentType,
    });
    return createValidatedResponse(PresignedUploadResponseDto, raw);
  }

  async getProfilePictureUrl(user: UserDocument) {
    this.ensureCandidateRole(user);
    const approvedUser = await this.waitForFileApproval(user.id.toString());
    console.log('the returned status is:', approvedUser);
    return this.uploadService.getProfilePictureUrl(user.id.toString());
  }

  private async waitForFileApproval(userId: string) {
      const timeout = 15000;
      const interval = 1000;
      const start = Date.now();
  
      while (Date.now() - start < timeout) {
        const user = await this.userModel.findById(userId);
  
        if (!user) throw new NotFoundException('User not found');
  
        const { profilePictureStatus } = user;
  
        if (profilePictureStatus === PictureCVStatus.REJECTED) {
          throw new BadRequestException(
            `Profile picture rejected: ${user.rejectionReason}`,
          );
        }
  
        if ( profilePictureStatus === PictureCVStatus.APPROVED) {
          return user.profilePictureStatus;
        }
        // console.log(`Waiting for file approval. Current status: ${profilePictureStatus}`);
  
        await new Promise((res) => setTimeout(res, interval));
      }
      throw new BadRequestException(
        'Files are still under review. Please try again in a few seconds.',
      );
    }
}
