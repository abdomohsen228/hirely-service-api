import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApplicationStatus } from '../enums/applicationStatus.enum';

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
  appliedAt: Date;

  /** 1-based stage in the hiring pipeline (UI: "Stage 2 of 5"). */
  @Prop({ default: 1, min: 1 })
  currentStage: number;

  @Prop({ default: 5, min: 1 })
  totalStages: number;

  /** Short label for the next milestone (e.g. "Technical Interview"). */
  @Prop()
  nextStepTitle?: string;

  @Prop({ default: null })
  nextStepAt?: Date | null;

  /** Match score 0–100 for tracker cards; optional until computed. */
  @Prop({ min: 0, max: 100 })
  matchScore?: number;

  /** High-level note for candidate (rejection reason, offer note, etc.). */
  @Prop()
  feedbackSummary?: string;
}

export const JobApplicationSchema = SchemaFactory.createForClass(JobApplication);
