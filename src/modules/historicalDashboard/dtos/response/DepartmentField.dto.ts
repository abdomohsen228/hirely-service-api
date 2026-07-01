import { ApiProperty } from "@nestjs/swagger";
import { InflowFilter } from "src/database/enums/historicalDashboardInflowFilter.enum";
export class DepartmetFieldDto{
    
    @ApiProperty({ description:'The Department of the applications stat'})
    department: string;

    @ApiProperty({ description:'Number of applications per department'})
    applications: number;

    
}