import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { JobStatus } from '../enums/jobStatus.enum';
import { ExperienceLevel } from '../enums/experienceYears.enum';
import { JobType } from '../enums/jobType.enum';
import { InterviewQuestion } from './interview_questions.schema';

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

  @Prop({ required: true })
  roleContext: string;

  @Prop({ required: true })
  coreResponsibilities: string;

  @Prop({ type: [String], default: [] })
  skills: string[];

  @Prop({ type: [String], default: [] })
  keywords: string[];

  @Prop({ type: [Types.ObjectId], default: [] })
  interviewerQuestions: Types.ObjectId[];

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

  @Prop({
    required: true,
    description: 'Start date of job being posted as open'
  })
  startDate: Date;

  @Prop({
    required: true,
    description: 'End date of job being posted as open'
  })
  endDate: Date;

  @Prop({
    type: Number,
    min: 1,
    max: 12,
    required: true,
    default: 4,
  })
  sprintDuration: number;

  @Prop({
    required: true,
    description: 'Start date of Interview phase '
  })
  interviewStartDate: Date;

  @Prop({
    required: true,
    description: 'End date of Interview phase'
  })
  interviewEndDate: Date;


}


export const JobSchema = SchemaFactory.createForClass(Job);

JobSchema.index({
  status: 1,
  endDate: 1,
})