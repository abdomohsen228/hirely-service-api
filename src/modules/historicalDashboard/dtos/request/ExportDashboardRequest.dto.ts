import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, isEnum } from "class-validator";
import { Types } from "mongoose";
import { DashboardExportFormat } from "src/database/enums/dashboardExportFormate.enum";
import { InflowFilter } from "src/database/enums/historicalDashboardInflowFilter.enum";
export class historicalExportRequestDto {
    @ApiProperty({ example: DashboardExportFormat.CSV, description: 'The format to export the dashboard data (csv or excel)' })
    @IsString()
    @IsNotEmpty()
    format: DashboardExportFormat;

    @ApiProperty({ example: InflowFilter.LAST_6_MONTHS , description: 'The inflow filter for the inflow section', default:InflowFilter.LAST_6_MONTHS })
    @IsOptional()
    filter?: InflowFilter;
}