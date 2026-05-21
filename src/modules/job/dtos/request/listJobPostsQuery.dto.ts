import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { CompanyIndustry } from 'src/database/enums/companyIndustry.enum';
import { ExperienceLevel } from 'src/database/enums/experienceYears.enum';
import { JobType } from 'src/database/enums/jobType.enum';

export enum DatePostedFilter {
  LAST_24_HOURS = '24h',
  LAST_7_DAYS = '7d',
  LAST_30_DAYS = '30d',
}

export enum WorkplaceTypeFilter {
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
  ONSITE = 'ONSITE',
}

export class ListJobPostsQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({
    description:
      'Search by job title, company name, department, skills, or keywords',
    example: 'graphic designer',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: JobType,
    example: JobType.FULL_TIME,
  })
  @IsOptional()
  @IsEnum(JobType)
  jobType?: JobType;

  @ApiPropertyOptional({
    enum: ExperienceLevel,
    example: ExperienceLevel.FRESH,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiPropertyOptional({
    enum: WorkplaceTypeFilter,
    description:
      'Inferred from location text until a dedicated workplaceType field exists',
    example: WorkplaceTypeFilter.REMOTE,
  })
  @IsOptional()
  @IsEnum(WorkplaceTypeFilter)
  workplaceType?: WorkplaceTypeFilter;

  @ApiPropertyOptional({
    description: 'Location text filter',
    example: 'United States',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    enum: CompanyIndustry,
    example: CompanyIndustry.FINANCE,
  })
  @IsOptional()
  @IsEnum(CompanyIndustry)
  industry?: CompanyIndustry;

  @ApiPropertyOptional({
    description:
      'Minimum acceptable compensation. Returns jobs where compensationMax is at least this value.',
    example: 120000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  salaryExpectation?: number;

  @ApiPropertyOptional({ example: 40000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSalary?: number;

  @ApiPropertyOptional({ example: 300000, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxSalary?: number;

  @ApiPropertyOptional({
    enum: DatePostedFilter,
    description: 'Filter by created date',
    example: DatePostedFilter.LAST_7_DAYS,
  })
  @IsOptional()
  @IsEnum(DatePostedFilter)
  datePosted?: DatePostedFilter;

  @ApiPropertyOptional({
    description: 'Candidate-only: true for applied jobs, false for not applied',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  applied?: boolean;

  @ApiPropertyOptional({
    description:
      'Accepted for Smart Discovery UI. No effect until the job schema stores this data.',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  sponsorshipProvided?: boolean;

  @ApiPropertyOptional({
    description:
      'Accepted for Smart Discovery UI. No effect until the job schema stores this data.',
    example: true,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  immediateStart?: boolean;

  @ApiPropertyOptional({
    description:
      'Accepted for the Hidden Jobs chip. No effect until hidden jobs are stored per candidate.',
    example: false,
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hiddenJobs?: boolean;
}
