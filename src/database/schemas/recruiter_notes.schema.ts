import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type RecruiterNoteDocument = HydratedDocument<RecruiterNote>;

@Schema({ timestamps: true })
export class RecruiterNote extends Document {
  @Prop()
  applicationId: Types.ObjectId;

  @Prop()
  content: string;

  @Prop()
  hr: Types.ObjectId;

}

export const RecruiterNoteSchema = SchemaFactory.createForClass(RecruiterNote);
