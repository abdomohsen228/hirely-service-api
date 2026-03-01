import { Prop, Schema } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { JobStatus } from '../enums/jobStatus.enum';
import { ExperienceLevel } from '../enums/experienceYears.enum';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true })
  location: string;

  @Prop({ required: true })
  createdBy: Types.ObjectId; // HR's ID

  @Prop({ required: true })
  jobType: string; // Full-time, Part-time, Contract, etc.

  @Prop({ required: true })
  department: string;

  @Prop({ 
    required: true,
    enum: ExperienceLevel, 
    default: ExperienceLevel.JUNIOR,
  })
  entryLevel: ExperienceLevel;

  @Prop({ 
    required: true ,
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  status: JobStatus; // Open, Closed, etc.

  @Prop({ required: true })
  evaluationCriteria: string; // What ??

  @Prop({ required: true })
  limit: number; // Number of candidates to hire for this job

  @Prop({ default: 0 })
  applicationCount: number;

}
