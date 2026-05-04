import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ExperienceLevel } from 'src/database/enums/experienceYears.enum';
import { JobType } from 'src/database/enums/jobType.enum';
import { JobStatus } from 'src/database/enums/jobStatus.enum';
import { CompanySize } from 'src/database/enums/companySize.enum';

export class JobPostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  department: string;

  @ApiProperty({ enum: JobType })
  jobType: JobType;

  @ApiProperty()
  location: string;

  @ApiProperty({ enum: ExperienceLevel })
  experienceLevel: ExperienceLevel;

  @ApiProperty()
  compensationMin: number;

  @ApiProperty()
  compensationMax: number;

  @ApiProperty()
  roleContext: string;

  @ApiProperty()
  coreResponsibilities: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  companySummary: string | null;

  @ApiPropertyOptional({ enum: CompanySize, nullable: true })
  companySize: CompanySize | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  hrName: string | null;

  @ApiProperty({ type: [String] })
  skills: string[];

  @ApiProperty({ type: [String] })
  keywords: string[];

  @ApiProperty({ type: [String] })
  interviewerQuestions: string[];

  @ApiPropertyOptional()
  documentAttachment?: string;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  createdBy: string;

  @ApiProperty({ enum: JobStatus })
  status: JobStatus;

  @ApiProperty()
  applicationCount: number;

  @ApiProperty()
  isCandidateApply?: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
