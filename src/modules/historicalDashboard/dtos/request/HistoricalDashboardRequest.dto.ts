import { ApiProperty } from "@nestjs/swagger";
import { IsOptional,IsNotEmpty, IsString } from "class-validator";
import { InflowFilter } from "src/database/enums/historicalDashboardInflowFilter.enum";
import { PaginationRequestDto } from "./PaginationRequest.dto";
export class HistoricalDashboardRequestDto{

    @ApiProperty({ example: InflowFilter.LAST_6_MONTHS, description: 'The application volume for the last 6 months', default: InflowFilter.LAST_6_MONTHS })
    @IsOptional()
    @IsNotEmpty()
    inflow_filter?: InflowFilter;

    @ApiProperty({ description: 'The pagination information for the volume by department section'})
    @IsOptional()
    @IsNotEmpty()
    volume_pagination?: PaginationRequestDto;

    @ApiProperty({ description: 'The pagination information for the active hiring process section'})
    @IsOptional()
    @IsNotEmpty()
    active_pagination?: PaginationRequestDto;


}