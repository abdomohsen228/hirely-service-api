import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
export type InterviewSprintDocument = InterviewSprint & Document;

@Schema({ timestamps: true })
export class InterviewSprint extends Document {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  jobId: Types.ObjectId;

  @Prop({ required: false })
  templateId: Types.ObjectId; // Reference to the InterviewTemplate

  @Prop({ required: true })
  start_date: Date;

  @Prop({ required: true })
  end_date: Date;

  @Prop({ required: true })
  createdBy: Types.ObjectId; // HR's ID
}

export const InterviewSprintSchema = SchemaFactory.createForClass(InterviewSprint);
