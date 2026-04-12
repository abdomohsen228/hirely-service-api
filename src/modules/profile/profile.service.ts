import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, isValidObjectId } from 'mongoose';
import { UserRole } from 'src/database/enums/userRole.enum';
import {
  Candidate,
  CandidateDocument,
} from 'src/database/schemas/candidate.schema';
import { UserDocument } from 'src/database/schemas/user.schema';
import { UploadService } from 'src/upload/upload.service';
import { createValidatedResponse } from './dtos/create-validated-response';
import { UpdateProfileRequestDto } from './dtos/request/updateProfile.request.dto';
import { CreateEducationRequestDto } from './dtos/request/createEducation.request.dto';
import { UpdateEducationRequestDto } from './dtos/request/updateEducation.request.dto';
import { CreateExperienceRequestDto } from './dtos/request/createExperience.request.dto';
import { UpdateExperienceRequestDto } from './dtos/request/updateExperience.request.dto';
import { UpdateSkillsRequestDto } from './dtos/request/updateSkills.request.dto';
import { UpdateEqualEmploymentRequestDto } from './dtos/request/updateEqualEmployment.request.dto';
import { UpdateProfilePhotoRequestDto } from './dtos/request/updateProfilePhoto.request.dto';
import { DeleteSuccessResponseDto } from './dtos/response/deleteSuccess.response.dto';
import { EqualEmploymentDataResponseDto } from './dtos/response/equalEmploymentData.response.dto';
import { EqualEmploymentPatchResponseDto } from './dtos/response/equalEmploymentPatch.response.dto';
import { PresignedUploadResponseDto } from './dtos/response/presignedUpload.response.dto';
import { SkillsPatchResponseDto } from './dtos/response/skillsPatch.response.dto';
import {
  buildProfileResponse,
  mapEducationEntry,
  mapExperienceEntry,
} from './profile.mapper';

function subdocToPlain(sub: unknown): Record<string, unknown> {
  const d = sub as { toObject?: () => Record<string, unknown> };
  if (typeof d?.toObject === 'function') {
    return d.toObject();
  }
  return JSON.parse(JSON.stringify(sub)) as Record<string, unknown>;
}

@Injectable()
export class ProfileService {
  constructor(
    @InjectModel(Candidate.name)
    private readonly candidateModel: Model<CandidateDocument>,
    private readonly uploadService: UploadService,
  ) {}

  private ensureCandidateRole(user: UserDocument): void {
    if (user.role !== UserRole.CANDIDATE) {
      throw new ForbiddenException('Only candidates can access this profile');
    }
  }

  private async getCandidateForUser(user: UserDocument): Promise<CandidateDocument> {
    this.ensureCandidateRole(user);
    let candidate = await this.candidateModel.findOne({ user: user._id });
    if (!candidate) {
      const legacyUsername = user.email.split('@')[0];
      candidate = await this.candidateModel.findOne({ username: legacyUsername });
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

  private parseObjectId(id: string): Types.ObjectId {
    if (!isValidObjectId(id)) {
      throw new BadRequestException('Invalid id');
    }
    return new Types.ObjectId(id);
  }

  async getProfile(user: UserDocument) {
    const candidate = await this.getCandidateForUser(user);
    return buildProfileResponse(user, candidate);
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
      portfolioUrl,
      mobileNumber,
    } = dto;

    if (fullName !== undefined) candidate.fullName = fullName;
    if (country !== undefined) candidate.country = country;
    if (bio !== undefined) candidate.profileSummary = bio;
    else if (profileSummary !== undefined) candidate.profileSummary = profileSummary;
    if (experienceLevel !== undefined) candidate.experienceLevel = experienceLevel;
    if (yearsOfExperience !== undefined) candidate.yearsOfExperience = yearsOfExperience;
    if (languages !== undefined) candidate.languages = languages;
    if (currentJobTitle !== undefined) candidate.currentJobTitle = currentJobTitle;
    if (portfolioUrl !== undefined) candidate.portfolioUrl = portfolioUrl;
    if (mobileNumber !== undefined) candidate.mobileNumber = mobileNumber;

    await candidate.save();
    return buildProfileResponse(user, candidate);
  }

  async updateProfilePhoto(user: UserDocument, body: UpdateProfilePhotoRequestDto) {
    this.ensureCandidateRole(user);
    const raw = await this.uploadService.updateProfilePictureUrl({
      userId: user.id,
      fileName: body.fileName,
      contentType: body.contentType,
    });
    return createValidatedResponse(PresignedUploadResponseDto, raw);
  }

  async addEducation(user: UserDocument, dto: CreateEducationRequestDto) {
    const candidate = await this.getCandidateForUser(user);
    candidate.educations.push({
      institution: dto.institution,
      degree: dto.degree,
      fieldOfStudy: dto.fieldOfStudy,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      description: dto.description,
    });
    await candidate.save();
    const created = candidate.educations[candidate.educations.length - 1];
    return mapEducationEntry(subdocToPlain(created));
  }

  async updateEducation(
    user: UserDocument,
    educationId: string,
    dto: UpdateEducationRequestDto,
  ) {
    const candidate = await this.getCandidateForUser(user);
    const oid = this.parseObjectId(educationId);
    const entry = candidate.educations.find((e) => e._id?.equals(oid));
    if (!entry) {
      throw new NotFoundException('Education entry not found');
    }
    if (dto.institution !== undefined) entry.institution = dto.institution;
    if (dto.degree !== undefined) entry.degree = dto.degree;
    if (dto.fieldOfStudy !== undefined) entry.fieldOfStudy = dto.fieldOfStudy;
    if (dto.startDate !== undefined) {
      entry.startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    }
    if (dto.endDate !== undefined) {
      entry.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    }
    if (dto.description !== undefined) entry.description = dto.description;
    candidate.markModified('educations');
    await candidate.save();
    return mapEducationEntry(subdocToPlain(entry));
  }

  async removeEducation(user: UserDocument, educationId: string) {
    const candidate = await this.getCandidateForUser(user);
    const oid = this.parseObjectId(educationId);
    const res = await this.candidateModel.updateOne(
      { _id: candidate._id },
      { $pull: { educations: { _id: oid } } },
    );
    if (res.modifiedCount === 0) {
      throw new NotFoundException('Education entry not found');
    }
    return createValidatedResponse(DeleteSuccessResponseDto, { deleted: true });
  }

  async addExperience(user: UserDocument, dto: CreateExperienceRequestDto) {
    const candidate = await this.getCandidateForUser(user);
    candidate.experiences.push({
      jobTitle: dto.jobTitle,
      companyName: dto.companyName,
      location: dto.location,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      description: dto.description,
      isCurrent: dto.isCurrent ?? false,
    });
    await candidate.save();
    const created = candidate.experiences[candidate.experiences.length - 1];
    return mapExperienceEntry(subdocToPlain(created));
  }

  async updateExperience(
    user: UserDocument,
    experienceId: string,
    dto: UpdateExperienceRequestDto,
  ) {
    const candidate = await this.getCandidateForUser(user);
    const oid = this.parseObjectId(experienceId);
    const entry = candidate.experiences.find((e) => e._id?.equals(oid));
    if (!entry) {
      throw new NotFoundException('Experience entry not found');
    }
    if (dto.jobTitle !== undefined) entry.jobTitle = dto.jobTitle;
    if (dto.companyName !== undefined) entry.companyName = dto.companyName;
    if (dto.location !== undefined) entry.location = dto.location;
    if (dto.startDate !== undefined) {
      entry.startDate = dto.startDate ? new Date(dto.startDate) : undefined;
    }
    if (dto.endDate !== undefined) {
      entry.endDate = dto.endDate ? new Date(dto.endDate) : undefined;
    }
    if (dto.description !== undefined) entry.description = dto.description;
    if (dto.isCurrent !== undefined) entry.isCurrent = dto.isCurrent;
    candidate.markModified('experiences');
    await candidate.save();
    return mapExperienceEntry(subdocToPlain(entry));
  }

  async removeExperience(user: UserDocument, experienceId: string) {
    const candidate = await this.getCandidateForUser(user);
    const oid = this.parseObjectId(experienceId);
    const res = await this.candidateModel.updateOne(
      { _id: candidate._id },
      { $pull: { experiences: { _id: oid } } },
    );
    if (res.modifiedCount === 0) {
      throw new NotFoundException('Experience entry not found');
    }
    return createValidatedResponse(DeleteSuccessResponseDto, { deleted: true });
  }

  async updateSkills(user: UserDocument, dto: UpdateSkillsRequestDto) {
    const candidate = await this.getCandidateForUser(user);
    candidate.skills = dto.skills;
    await candidate.save();
    return createValidatedResponse(SkillsPatchResponseDto, {
      skills: candidate.skills,
    });
  }

  async updateEqualEmployment(
    user: UserDocument,
    dto: UpdateEqualEmploymentRequestDto,
  ) {
    const candidate = await this.getCandidateForUser(user);
    candidate.equalEmployment = {
      ...candidate.equalEmployment,
      ...dto,
    };
    await candidate.save();
    const eq = candidate.equalEmployment;
    const data = eq
      ? createValidatedResponse(EqualEmploymentDataResponseDto, {
          gender: eq.gender,
          raceOrEthnicity: eq.raceOrEthnicity,
          veteranStatus: eq.veteranStatus,
          disabilityStatus: eq.disabilityStatus,
        })
      : undefined;
    return createValidatedResponse(EqualEmploymentPatchResponseDto, {
      equalEmployment: data,
    });
  }
}
