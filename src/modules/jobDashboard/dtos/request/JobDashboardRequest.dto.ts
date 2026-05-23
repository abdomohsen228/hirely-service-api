import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional } from "class-validator";
import { Types } from "mongoose";

export class JobDashboardRequestDto {
    @ApiProperty({ example: '507f1f77bcf86cd799439011', description: 'The unique identifier of the job' })
    @IsString()
    @IsNotEmpty()
    jobId: Types.ObjectId;
}