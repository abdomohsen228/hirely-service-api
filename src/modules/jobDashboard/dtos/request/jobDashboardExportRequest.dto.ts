import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, isEnum } from "class-validator";
import { Types } from "mongoose";
import { DashboardExportFormat } from "src/database/enums/dashboardExportFormate.enum";

export class jobDasboardExportRequestDto {
    @ApiProperty({ example: DashboardExportFormat.EXCEL, description: 'The format to export the dashboard data (csv or excel)' })
    @IsString()
    @IsNotEmpty()
    format: DashboardExportFormat;

    @ApiProperty({ example: 1, description: 'The page number for pagination', required: false })
    @IsOptional()
    @IsNotEmpty()
    page?: number;

    @ApiProperty({ example: 10, description: 'The number of items per page for pagination', required: false })
    @IsOptional()
    @IsNotEmpty()
    limit?: number;

    @ApiProperty({ example: 'Pending', description: 'Filter applications by status', required: false })
    @IsOptional()
    @IsString()
    applicationStatus?: string;

    @ApiProperty({ example: '80', description: 'Filter applications by match score', required: false })
    @IsOptional()
    @IsString()
    matchScore?: number;
}