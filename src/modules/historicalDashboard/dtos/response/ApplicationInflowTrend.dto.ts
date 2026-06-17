import { ApiProperty } from "@nestjs/swagger";
import { InflowFilter } from "src/database/enums/historicalDashboardInflowFilter.enum";
import { InflowFieldDto } from "./InflowField.dto";
export class ApplicationInflowTrendDto{
    
    @ApiProperty({ description:'Filter of the inflow section'})
    inflowFilter: InflowFilter;

    @ApiProperty({ description:'Inflow Data fields months + num of applications'})
    inflowData: InflowFieldDto[];

    @ApiProperty({ description:'total applications in the inflowData'})
    totalApplications: number;
       
    
}