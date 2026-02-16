import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { JobStatus } from '../enums/jobStatus.enum';
import { ExperienceYears } from '../enums/experienceYears.enum';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  companyname: string;

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
    enum: ExperienceYears, 
    default: ExperienceYears.JUNIOR,
  })
  entryLevel: ExperienceYears;

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