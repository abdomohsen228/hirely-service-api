import { BadRequestException, Injectable, NotFoundException, NotAcceptableException } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { randomUUID } from 'crypto';
import * as path from 'path'
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/database/schemas/user.schema';
import { PictureCVStatus } from 'src/database/enums/pictureCVstatus.enum';
import { 
    MAX_IMAGE_FILE_SIZE_BYTES,
    MAX_PDF_FILE_SIZE_BYTES,
    ALLOWED_IMAGE_MIME_TYPES,
    ALLOWED_PDF_MIME_TYPES,
    ALLOWED_IMAGE_EXTENSIONS,
    ALLOWED_PDF_EXTENSIONS
    } from 'src/config/multer-constants';
/* This file is to create the actual links needed to upload from the presistent storage low-level s3 folder */
@Injectable()
export class UploadService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly s3Service: S3Service
    ) { }
    private readonly bucket = process.env.AWS_S3_BUCKET_NAME!;

    async createVideoUploadUrl(params: {
        userId: string;
        fileName: string;
        contentType: string;
        role: 'candidate' | 'hr';
    }) {
        const Id = randomUUID();
        const extension = path.extname(params.fileName);
        let key = '';
        if (params.role === 'candidate') {
            key = `interviews/answers/${params.userId}/${Id}/${extension}`;
        } else {
            key = `interviews/questions/${params.userId}/${Id}/${extension}`;
        }

        return this.s3Service.createUploadUrl({
            bucket: this.bucket,
            key,
            contentType: params.contentType,
        });
    }

    async createCvUploadUrl(params: {
        userId: string;
        fileName: string;
        contentType: string;
        filesize: number;
    }) { 
        if (params.filesize > MAX_PDF_FILE_SIZE_BYTES) {
            throw new NotAcceptableException('File size exceeds the allowed limit of 10MB.');
        }
        if (!ALLOWED_PDF_MIME_TYPES.includes(params.contentType)) {
            throw new NotAcceptableException('Invalid file format');
        }
        if (!ALLOWED_PDF_EXTENSIONS.includes(path.extname(params.fileName))) {
            throw new NotAcceptableException('Invalid file extension');
        }

        const Id = randomUUID();
        const extension = path.extname(params.fileName);
        const key = `cvs/${params.userId}/${Id}/${extension}`;

        const user = await this.userModel.findById(params.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.cvUrl = key;
        user.cvStatus = PictureCVStatus.PENDING;
        await user.save();

        return this.s3Service.createUploadUrl({
            bucket: this.bucket,
            key,
            contentType: params.contentType,
        });
    }

    async createProfilePictureUploadUrl(params: {
        userId: string;
        fileName: string;
        contentType: string;
        filesize: number;
    }) {
        if (params.filesize > MAX_IMAGE_FILE_SIZE_BYTES) {
            throw new NotAcceptableException('File size exceeds the allowed limit.');
        }
        if (!ALLOWED_IMAGE_MIME_TYPES.includes(params.contentType)) {
            throw new NotAcceptableException('Invalid image format');
        }
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(path.extname(params.fileName))) {
            throw new NotAcceptableException('Invalid image extension');
        }
        

        const Id = randomUUID();
        const extension = path.extname(params.fileName);
        const key = `profile_pictures/${params.userId}/${Id}${extension}`;

        const user = await this.userModel.findById(params.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        user.profilePictureUrl = key;
        user.profilePictureStatus = PictureCVStatus.PENDING;
        console.log("Profile Picture URL:", user.profilePictureUrl);
        await user.save();

        return this.s3Service.createUploadUrl({
            bucket: this.bucket,
            key,
            contentType: params.contentType,
        });
    }

    async getProfilePictureUrl(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }console.log("Returning Profile Picture URL:", user.profilePictureUrl);
        if (user.profilePictureStatus !== PictureCVStatus.APPROVED) {
            throw new BadRequestException('User has no profile picture or their profile picture is not approved yet');
        }
        
        return user.profilePictureUrl;
    }

    async getCvUrl(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (user.cvStatus !== PictureCVStatus.APPROVED) {
            throw new BadRequestException('User has no CV or their CV is not approved yet');
        }
        return user.cvUrl;
    }

    async updateProfilePictureUrl(params: {
        userId: string;
        fileName: string;
        contentType: string;
        filesize: number;
    }) {
        // console.log(params);
        const user = await this.userModel.findById(params.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const key = user.profilePictureUrl;

        if (params.filesize > MAX_IMAGE_FILE_SIZE_BYTES) {
            throw new NotAcceptableException('File size exceeds the allowed limit.');
        }
        if (!ALLOWED_IMAGE_EXTENSIONS.includes(path.extname(params.fileName))) {
            throw new NotAcceptableException('Invalid image extension');
        }

        await this.s3Service.deleteFile({ key, bucket: this.bucket });
        // console.log(`Deleted old profile picture with key: ${key}`);

        return this.createProfilePictureUploadUrl({
            userId: params.userId,
            fileName: params.fileName,
            contentType: params.contentType,
            filesize: params.filesize
        });
    }

    async updateCvUrl(params: {
        userId: string;
        fileName: string;
        contentType: string;
        filesize: number;
    }) {
        const user = await this.userModel.findById(params.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const key = user.cvUrl;

        if (params.filesize > MAX_PDF_FILE_SIZE_BYTES) {
            throw new NotAcceptableException('File size exceeds the allowed limit of 10MB.');
        }
        if (!ALLOWED_PDF_MIME_TYPES.includes(params.contentType)) {
            throw new NotAcceptableException('Invalid PDF format');
        }
        if (!ALLOWED_PDF_EXTENSIONS.includes(path.extname(params.fileName))) {
            throw new NotAcceptableException('Invalid file extension');
        }

        await this.s3Service.deleteFile({ key, bucket: this.bucket });

        return this.createCvUploadUrl({
            userId: params.userId,
            fileName: params.fileName,
            contentType: params.contentType,
            filesize: params.filesize
        });
    }

    // Approval and rejection functions after s3 triggers validations events
    async approveProfilePicture(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.profilePictureStatus = PictureCVStatus.APPROVED;
        await user.save();
        return { message: 'Profile picture approved' };
    }

    async rejectProfilePicture(userId: string,rejectionReason: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.profilePictureStatus = PictureCVStatus.REJECTED;
        user.profilePictureUrl = undefined;
        await user.save();
        return { message: `Profile picture rejected\nReason: ${rejectionReason}` };
    }

    async approveCv(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.cvStatus = PictureCVStatus.APPROVED;
        await user.save();
        return { message: 'CV approved' };
    }

    async rejectCv(userId: string,rejectionReason: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        user.cvStatus = PictureCVStatus.REJECTED;
        user.cvUrl = undefined;
        await user.save();
        return { message: `CV rejected\nReason: ${rejectionReason}` };
    }

    async testConnection() {
        return this.s3Service.testConnection();
    }
}