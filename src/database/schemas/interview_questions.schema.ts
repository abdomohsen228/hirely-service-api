import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { QuestionTypes } from '../enums/questionTypes.enum';

export type InterviewQuestionDocument = InterviewQuestion & Document;

@Schema({ timestamps: true })
export class InterviewQuestion extends Document {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  answerDuration: number; // Duration in seconds

  // @Prop({ required: true })
  // templateId: Types.ObjectId;

  @Prop({ required : false })
  jobId: Types.ObjectId;

  @Prop({ required: true })
  createdBy: Types.ObjectId; // HR's ID

  @Prop({ default: 0 })
  order: number; // Order of the question in the interview template
}

export const InterviewQuestionSchema = SchemaFactory.createForClass(InterviewQuestion);