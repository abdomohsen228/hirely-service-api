import { Module } from "@nestjs/common";
import { UploadService } from "./upload.service";
import { UploadController } from "./upload.controller";
import { S3Module } from "../s3/s3.module";
import { AuthModule } from "src/modules/auth/auth.module";
@Module({
    imports: [S3Module, AuthModule],
    providers: [UploadService],
    controllers: [UploadController],
})
export class UploadModule {}