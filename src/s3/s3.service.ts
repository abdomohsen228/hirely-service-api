import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
// import { randomUUID } from 'crypto';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
@Injectable()
export class S3Service {
    constructor(
        @Inject('S3_CLIENT') private readonly s3: S3Client,
        private readonly s3Config: ConfigService
    ) {}

    async createUploadUrl(params: {
        bucket: string;
        key: string;
        contentType: string;
        expiresIn?: number;
    }) {
        const put = new PutObjectCommand({
            Bucket: params.bucket,
            Key: params.key,
            ContentType: params.contentType,
        });
        const url = await getSignedUrl(this.s3, put, { expiresIn: params.expiresIn ?? 3600 });
        return {
            uploadUrl : url,
            key: params.key,
        };
    }
    

    //////////////////////////////////////////////
    async getFileUrl(key: string) {
        const bucketName = this.s3Config.get<string>('aws.s3BucketName');
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key,
        });
        const url = await getSignedUrl(this.s3, command, { expiresIn: 500 });
        return url;
    }
    
  
}