import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApplicationStatus } from '../enums/applicationStatus.enum';
import App from 'next/app';

export type JobApplicationDocument = JobApplication & Document;

@Schema({ timestamps: true })
export class JobApplication extends Document {
  @Prop({ required: true })
  candidateId: Types.ObjectId; // Reference to the Candidate

  @Prop({ required: true })
  jobId: Types.ObjectId; // Reference to the Job

  @Prop({ required: true })
  resumeUrl: string; // URL to the candidate's resume

  @Prop({ 
    required: true,
    enum: ApplicationStatus,
    default: ApplicationStatus.APPLIED,
 })
  status: ApplicationStatus; 

  @Prop({ default: null })
  appliedAt: Date
}