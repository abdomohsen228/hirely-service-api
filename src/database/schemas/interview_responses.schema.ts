import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type InterviewResponseDocument = InterviewResponse & Document;

@Schema({ timestamps: true })
export class InterviewResponse extends Document {
  @Prop({ required: true })
  candidateInterviewId: Types.ObjectId; // Reference to CandidateInterview

  @Prop({ required: true })
  questionId: Types.ObjectId; // Reference to InterviewQuestion

  @Prop({ required: true })
  response: string; // Candidate's answer to the question

  @Prop({ required: true })
  transcription: string;

  @Prop({ required: true })
  responseDuration: number; // Duration in seconds that the candidate took to answer the question
}
