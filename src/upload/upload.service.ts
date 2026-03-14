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
    }) { 
        
        if (!ALLOWED_PDF_MIME_TYPES.includes(params.contentType)) {
            throw new NotAcceptableException('Invalid file format');
        }
        if (!ALLOWED_PDF_EXTENSIONS.includes(path.extname(params.fileName))) {
            throw new NotAcceptableException('Invalid file extension');
        }

        const Id = randomUUID();
        const extension = path.extname(params.fileName);
        const key = `resumes/${params.userId}/${Id}${extension}`;

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
    }) {
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
        }
        if (user.profilePictureStatus !== PictureCVStatus.APPROVED) {
            throw new BadRequestException(user.rejectionReason ? `Profile picture not approved\nReason: ${user.rejectionReason}` : 'User has no profile picture or their profile picture is not approved yet');
        }
        const key = user.profilePictureUrl;
        return this.s3Service.getUrl({ key, bucket: this.bucket });
        
    }

    async getCvUrl(userId: string) {
        const user = await this.userModel.findById(userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if (user.cvStatus !== PictureCVStatus.APPROVED) {
            throw new BadRequestException(user.rejectionReason ? `CV not approved\nReason: ${user.rejectionReason}` : 'User has no CV or their CV is not approved yet');
        }
        return this.s3Service.getUrl({ key: user.cvUrl, bucket: this.bucket });
    }

    async updateProfilePictureUrl(params: {
        userId: string;
        fileName: string;
        contentType: string;
    }) {
        // console.log(params);
        const user = await this.userModel.findById(params.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const key = user.profilePictureUrl;

        if (!ALLOWED_IMAGE_EXTENSIONS.includes(path.extname(params.fileName))) {
            throw new NotAcceptableException('Invalid image extension');
        }

        await this.s3Service.deleteFile({ key, bucket: this.bucket });
        // console.log(`Deleted old profile picture with key: ${key}`);

        return this.createProfilePictureUploadUrl({
            userId: params.userId,
            fileName: params.fileName,
            contentType: params.contentType
        });
    }

    async updateCvUrl(params: {
        userId: string;
        fileName: string;
        contentType: string;
    }) {
        const user = await this.userModel.findById(params.userId);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        const key = user.cvUrl;

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
            contentType: params.contentType
        });
    }

    // Approval and rejection functions after s3 triggers validations events
    async validateProfileUpload(key: string, status: string, reason: string) {
        const user = await this.userModel.findOne({ profilePictureUrl: key });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if(status === 'success') {
            user.profilePictureStatus = PictureCVStatus.APPROVED;
            user.rejectionReason = undefined;
            await user.save();
            return { message: 'Profile picture approved' };
        } else {
            user.profilePictureStatus = PictureCVStatus.REJECTED;
            user.rejectionReason = reason;
            await user.save();
            return { message: `Profile picture rejected\nReason: ${reason}` };
        }
    }

    async validateCvUpload(key: string, status: string, reason: string) {
        const user = await this.userModel.findOne({ cvUrl: key });
        if (!user) {
            throw new NotFoundException('User not found');
        }
        if(status === 'success') {
            user.cvStatus = PictureCVStatus.APPROVED;
            user.rejectionReason = undefined;
            await user.save();
            return { message: 'CV approved' };
        } else {
            user.cvStatus = PictureCVStatus.REJECTED;
            user.rejectionReason = reason;
            await user.save();
            return { message: `CV rejected\nReason: ${reason}` };
        }
    }

    // async validateVideoUpload(key: string, status: string, reason: string) {
    //     const user = await this.userModel.findOne({ videoUrl: key });
    //     if (!user) {
    //         throw new NotFoundException('User not found');
    //     }
    //     if(status === 'success') {
    //         user.videoStatus = PictureCVStatus.APPROVED;
    //         await user.save();
    //         return { message: 'Video approved' };
    //     } else {
    //         user.videoStatus = PictureCVStatus.REJECTED;
    //         user.videoUrl = undefined;
    //         await user.save();
    //         return { message: `Video rejected\nReason: ${reason}` };
    //     }
    // }

    async testConnection() {
        return this.s3Service.testConnection();
    }
}