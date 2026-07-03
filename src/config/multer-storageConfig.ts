import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { BadRequestException } from '@nestjs/common';

const id = uuidv4();
import {
  ALLOWED_IMAGE_MIME_TYPES,
  ALLOWED_PDF_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
} from './multer-constants';
import { ImageUploadRequest } from './interfaces/image-upload-request.interface';

export class MulterFileSystemStorage {
  static getStorageConfig(uploadType: 'userIds', maxFileCount: number = 5) {
    return {
      storage: diskStorage({
        destination: (
          req: ImageUploadRequest,
          file: Express.Multer.File,
          cb,
        ) => {
          const userId = req.user?._id?.toString();

          if (!userId) {
            return cb(new Error('Invalid user id'), '');
          }

          let subFolder = '';

          if (file.fieldname === 'profilePicture') {
            subFolder = 'profileImage';
          } else if (file.fieldname === 'cvFile') {
            subFolder = 'cv';
          } else {
            return cb(new Error('Unexpected file field'), '');
          }

          const uploadPath = path.join(
            __dirname,
            '..',
            '..',
            'uploads',
            `user_${userId}`,
            subFolder,
          );

          fs.mkdirSync(uploadPath, { recursive: true });

          cb(null, uploadPath);
        },
        filename: (
          imageUploadRequest: ImageUploadRequest,
          fileUploadRequest,
          imageFileNameCallback,
        ) => {
          const uniqueFileId = id;
          imageUploadRequest.uploadUUID = uniqueFileId;

          const baseFileName = path
            .basename(
              fileUploadRequest.originalname,
              path.extname(fileUploadRequest.originalname),
            )
            .replace(/[^\w\-]/g, '_');
          const fileExt = path.extname(fileUploadRequest.originalname);
          const storedFileName = `${uniqueFileId}_${baseFileName}${fileExt}`;

          if (!imageUploadRequest.uploadedFilenames)
            imageUploadRequest.uploadedFilenames = [];
          imageUploadRequest.uploadedFilenames.push(storedFileName);

          imageFileNameCallback(null, storedFileName);
        },
      }),
      limits: { fileSize: MAX_IMAGE_FILE_SIZE_BYTES, file: maxFileCount },

      fileFilter: (req: Request, file: Express.Multer.File, cb) => {
        if (file.fieldname === 'profilePicture') {
          if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
            return cb(new Error('Invalid image type'), false);
          }
        } else if (file.fieldname === 'cvFile') {
          if (!ALLOWED_PDF_MIME_TYPES.includes(file.mimetype)) {
            return cb(new BadRequestException('CV must be a PDF file'), false);
          }
        } else {
          return cb(new BadRequestException('Unexpected file field'), false);
        }

        cb(null, true);
      },
    };
  }
}
