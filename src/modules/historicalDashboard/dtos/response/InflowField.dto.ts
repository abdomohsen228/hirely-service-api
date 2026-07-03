import { ApiProperty } from "@nestjs/swagger";

export class InflowFieldDto{
    
    @ApiProperty({ description:'The month period of the stat', example:'2026-01'})
    month: string;
    
    @ApiProperty({ description:'Total number of applications in that period'})
    total_applications: number;

    
}