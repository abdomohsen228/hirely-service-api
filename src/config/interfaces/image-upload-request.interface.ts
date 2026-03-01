import { Request } from 'express';
import { Types } from 'mongoose';

export interface ImageUploadRequest extends Request {
  user?: {
    _id: Types.ObjectId;
    role: string;
    email: string;
  };

  uploadUserId?: string;
  uploadUUID?: string;
  uploadedFilenames?: string[];
}
