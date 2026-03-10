import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from "@nestjs/config";
import { S3Client, PutObjectCommand, GetObjectCommand, HeadBucketCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
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

    async deleteFile(params:{
        key: string,
        bucket: string
    }) {
        const command = new DeleteObjectCommand({
            Bucket: params.bucket ?? this.s3Config.get<string>('aws.s3BucketName'),
            Key: params.key
        });
        return await this.s3.send(command);
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
    


    async testConnection(bucketName:string = this.s3Config.get<string>('aws.s3BucketName')) {
        try {
            const result = await this.s3.send(new HeadBucketCommand({ Bucket: bucketName }));
            console.log('S3 Connection Test Successful.');
            return result;
        } catch (error) {
            console.error('Error testing S3 connection:', error);
            throw new Error('Failed to test S3 connection');
        }
    }
}