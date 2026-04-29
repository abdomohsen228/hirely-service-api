import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { JobStatus } from '../enums/jobStatus.enum';
import { ExperienceLevel } from '../enums/experienceYears.enum';
import { JobType } from '../enums/jobType.enum';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  department: string;

  @Prop({
    type: String,
    enum: JobType,
    required: true,
  })
  jobType: JobType;

  @Prop({ required: true })
  location: string;

  @Prop({
    type: String,
    enum: ExperienceLevel,
    required: true,
  })
  experienceLevel: ExperienceLevel;

  @Prop({ required: true, min: 0 })
  compensationMin: number;

  @Prop({ required: true, min: 0 })
  compensationMax: number;

  @Prop({ required: true })
  roleContext: string;

  @Prop({ required: true })
  coreResponsibilities: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: [String], default: [] })
  interviewerQuestions: string[];

  @Prop()
  documentAttachment?: string;

  @Prop({ required: true })
  companyName: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'Hr' })
  hr: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  createdBy: Types.ObjectId;

  @Prop({
    type: String,
    enum: JobStatus,
    default: JobStatus.OPEN,
  })
  status: JobStatus;

  @Prop({ default: 0 })
  applicationCount: number;
}

export const JobSchema = SchemaFactory.createForClass(Job);
