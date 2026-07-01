import { ApiProperty } from "@nestjs/swagger";
import { InflowFilter } from "src/database/enums/historicalDashboardInflowFilter.enum";
export class ActiveHiringProcessFieldDto{
    
    @ApiProperty({ description:'Name of the job role'})
    Role_name: string;

    @ApiProperty({ description:'The Department this job targeting'})
    department: string;
    
    @ApiProperty({ description:'The percentage of where the hiring progress in'})
    hiring_progress: number;
    
    @ApiProperty({ description:'The end date of the hiring process for the target job'})
    target_date: Date;

    
}