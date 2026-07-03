import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  Max,
  IsDate
} from 'class-validator';
import { ArchitecturalAlignmentSectionDto } from './ArchitecturalAlignmentSection.dto';
import { CVSectionDto } from './CVSection.dto';
import { ProfileSectionDto } from './ProfileSection.dto';
import { RecruiterNotesSectionDto } from './RecruiterNotesSection.dto';
import { VideoAnalysisSectionDto } from './VideoAnalysisSection.dto';

export class ApplicationSumResponseDto {
  @ApiProperty({ description: 'Applied Candidate Information Section' })
  @IsNotEmpty()
  ProfileSection: ProfileSectionDto;

  @ApiProperty({ description: 'Architectural Alignment Information Section' })
  @IsNotEmpty()
  ArchitecturalAlignmentSection: ArchitecturalAlignmentSectionDto;

  @ApiProperty({ description: 'CV Information Section' })
  @IsNotEmpty()
  CVSection: CVSectionDto;

  @ApiProperty({ description: 'Recruiter Notes Section' })
  @IsNotEmpty()
  RecruiterNotesSection: RecruiterNotesSectionDto;

  @ApiProperty({ description: 'Recorded Video, Behavioral Analysis and Transcription Data' })
  @IsNotEmpty()
  VideoAnalysisSection: VideoAnalysisSectionDto[];

  
}
