import { CandidateDocument } from 'src/database/schemas/candidate.schema';
import { UserDocument } from 'src/database/schemas/user.schema';
import { createValidatedResponse } from './dtos/create-validated-response';
import { EducationEntryResponseDto } from './dtos/response/educationEntry.response.dto';
import { EqualEmploymentDataResponseDto } from './dtos/response/equalEmploymentData.response.dto';
import { ExperienceEntryResponseDto } from './dtos/response/experienceEntry.response.dto';
import { ProfileResponseDto } from './dtos/response/profile.response.dto';

function toIso(d: unknown): string | undefined {
  if (d == null) return undefined;
  if (d instanceof Date) return d.toISOString();
  const t = new Date(d as string | number);
  return Number.isNaN(t.getTime()) ? undefined : t.toISOString();
}

function subdocId(e: { _id?: { toString(): string }; id?: string }): string {
  if (e._id) return e._id.toString();
  if (e.id) return String(e.id);
  return '';
}

export function mapEducationEntry(
  e: Record<string, unknown>,
): EducationEntryResponseDto {
  return createValidatedResponse(EducationEntryResponseDto, {
    id: subdocId(e as { _id?: { toString(): string }; id?: string }),
    institution: e.institution as string | undefined,
    degree: e.degree as string | undefined,
    fieldOfStudy: e.fieldOfStudy as string | undefined,
    startDate: toIso(e.startDate),
    endDate: toIso(e.endDate),
    description: e.description as string | undefined,
  });
}

export function mapExperienceEntry(
  e: Record<string, unknown>,
): ExperienceEntryResponseDto {
  return createValidatedResponse(ExperienceEntryResponseDto, {
    id: subdocId(e as { _id?: { toString(): string }; id?: string }),
    jobTitle: e.jobTitle as string,
    companyName: e.companyName as string,
    location: e.location as string | undefined,
    startDate: toIso(e.startDate),
    endDate: toIso(e.endDate),
    description: e.description as string | undefined,
    isCurrent: e.isCurrent as boolean | undefined,
  });
}

export function buildProfileResponse(
  user: UserDocument,
  candidate: CandidateDocument,
): ProfileResponseDto {
  const c = candidate.toObject();
  const educations = (c.educations ?? []).map((e) =>
    mapEducationEntry(e as Record<string, unknown>),
  );
  const experiences = (c.experiences ?? []).map((e) =>
    mapExperienceEntry(e as unknown as Record<string, unknown>),
  );

  let equalEmployment: EqualEmploymentDataResponseDto | undefined;
  if (c.equalEmployment && Object.keys(c.equalEmployment).length > 0) {
    equalEmployment = createValidatedResponse(EqualEmploymentDataResponseDto, {
      gender: c.equalEmployment.gender,
      raceOrEthnicity: c.equalEmployment.raceOrEthnicity,
      veteranStatus: c.equalEmployment.veteranStatus,
      disabilityStatus: c.equalEmployment.disabilityStatus,
    });
  }

  const withTimestamps = c as unknown as {
    createdAt?: unknown;
    updatedAt?: unknown;
  };
  const createdAt =
    toIso(withTimestamps.createdAt) ?? new Date().toISOString();
  const updatedAt = toIso(withTimestamps.updatedAt) ?? createdAt;

  return createValidatedResponse(ProfileResponseDto, {
    id: candidate._id.toString(),
    userId: user.id,
    email: user.email,
    profilePictureUrl: user.profilePictureUrl ?? c.profilePictureUrl,
    profilePictureStatus: user.profilePictureStatus,
    // cvUrl: user.cvUrl,
    cvStatus: user.cvStatus,
    fullName: c.fullName,
    username: c.username,
    mobileNumber: c.mobileNumber,
    country: c.country,
    // education: c.education,
    educations,
    experiences,
    equalEmployment,
    experienceLevel: c.experienceLevel,
    skills: c.skills ?? [],
    yearsOfExperience: c.yearsOfExperience,
    profileSummary: c.profileSummary,
    // bio: c.profileSummary,
    languages: c.languages ?? [],
    currentJobTitle: c.currentJobTitle,
    cvFileUrl: c.cvFileUrl,
    linkedInUrl: c.linkedInUrl,
    githubUrl: c.githubUrl,
    profileStatus: c.profileStatus,
    createdAt,
    updatedAt,
  });
}
