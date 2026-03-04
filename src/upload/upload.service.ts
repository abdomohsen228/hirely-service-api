import { Injectable, Inject } from '@nestjs/common';
import { S3Service } from 'src/s3/s3.service';
import { randomUUID } from 'crypto';
import * as path from 'path'
/* This file is to create the actual links needed to upload from the presistent storage low-level s3 folder */
@Injectable()
export class UploadService {
    constructor(
        @Inject('S3_SERVICE') private readonly s3Service: S3Service
    ) {}
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
        if(params.role === 'candidate') {
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
        const Id = randomUUID();
        const extension = path.extname(params.fileName);
        const key = `cvs/${params.userId}/${Id}/${extension}`;
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
        const Id = randomUUID();
        const extension = path.extname(params.fileName);
        const key = `profile_pictures/${params.userId}/${Id}/${extension}`;
        return this.s3Service.createUploadUrl({
            bucket: this.bucket,
            key,
            contentType: params.contentType,
        });
    }
}