import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { S3Module } from "../s3/s3.module";
import { AuthModule } from "src/modules/auth/auth.module";
import { UploadQueueModule } from "src/queues/upload-queue/queue.module";
import { UploadProcessor } from "src/queues/upload-queue/processor/upload.processor";
@Module({
    imports: [S3Module, AuthModule, UploadQueueModule],
    providers: [UploadService, UploadProcessor],
    controllers: [UploadController],
    exports: [UploadService],
})
export class UploadModule {}