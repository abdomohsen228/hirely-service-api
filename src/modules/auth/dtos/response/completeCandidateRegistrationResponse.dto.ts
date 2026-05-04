import { ApiProperty } from '@nestjs/swagger';
import { ExperienceLevel } from 'src/database/enums/experienceYears.enum';

export class CompleteCandidateRegistrationResponseDto {
  @ApiProperty({ example: 'Abdo Mohamed' })
  fullName: string;

  @ApiProperty({ example: '+201012345678' })
  mobileNumber: string;

  @ApiProperty({ example: 'Egypt' })
  country: string;

  @ApiProperty({ example: 'Cairo University', required: false })
  education?: string;

  @ApiProperty({ enum: ExperienceLevel })
  experienceLevel: ExperienceLevel;

  @ApiProperty({ example: 3 })
  yearsOfExperience: number;

  @ApiProperty({
    example: 'Passionate backend engineer with 3 years experience...',
    required: false,
  })
  profileSummary?: string;

  @ApiProperty({
    example: ['Node.js', 'NestJS'],
    required: false,
    type: [String],
  })
  skills?: string[];

  @ApiProperty({
    example: ['English', 'Arabic'],
    required: false,
    type: [String],
  })
  languages?: string[];

  @ApiProperty({ example: 'Backend Developer', required: false })
  currentJobTitle?: string;

  @ApiProperty({
    example:
      'profile_pictures/69deda35a0c2266fa53d9db4/9cec7a67-af62-475c-956d-99dd…',
    required: false,
  })
  profilePictureUrl?: string;

  @ApiProperty({
    example:
      'resumes/69deda35a0c2266fa53d9db4/9268f490-f8e8-4022-959c-52f86c4c2e39.…',
    required: true,
  })
  cvFileUrl?: string;

  @ApiProperty({
    example: 'https://linkedin.com',
    required: false,
  })
  linkedInUrl?: string;

  @ApiProperty({
    example: 'https://github.com',
    required: false,
  })
  GitHubUrl?: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;
  static fromEntity(
    candidate: any,
    accessToken: string,
  ): CompleteCandidateRegistrationResponseDto {
    return {
      fullName: candidate.fullName,
      mobileNumber: candidate.mobileNumber,
      country: candidate.country,
      education: candidate.education,
      experienceLevel: candidate.experienceLevel,
      yearsOfExperience: candidate.yearsOfExperience,
      profileSummary: candidate.profileSummary,
      skills: candidate.skills,
      languages: candidate.languages,
      currentJobTitle: candidate.currentJobTitle,
      profilePictureUrl: candidate.profilePictureUrl,
      cvFileUrl: candidate.cvFileUrl,
      linkedInUrl: candidate.linkedInUrl,
      GitHubUrl: candidate.githubUrl,
      accessToken,
    };
  }
}
