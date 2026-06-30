import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { CandidateInterviewStatus } from '../enums/candidateInterviewStatus.enum';

export type CandidateInterviewDocument = CandidateInterview & Document;

@Schema({ timestamps: true })
export class CandidateInterview extends Document {
  @Prop({ required: true })
  applicationId: Types.ObjectId; // Reference to the Application

  @Prop({ required: false })
  sprintId: Types.ObjectId; // Reference to the InterviewSprint

  @Prop({ required: true })
  jobId: Types.ObjectId; // Reference to the Job

  @Prop({
    required: true,
    enum: CandidateInterviewStatus,
    default: CandidateInterviewStatus.INVITED,
  })
  status: CandidateInterviewStatus; // INVITED / STARTED / SUBMITTED / EVALUATED

  @Prop({ required: true })
  started_at: Date;

  @Prop({ default: null })
  submitted_at: Date;
}

export const CandidateInterviewSchema =
  SchemaFactory.createForClass(CandidateInterview);

CandidateInterviewSchema.index({ applicationId: 1 }, { unique: true });
CandidateInterviewSchema.index({ jobId: 1, status: 1 });
