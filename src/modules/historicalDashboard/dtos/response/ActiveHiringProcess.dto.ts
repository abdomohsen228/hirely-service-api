import { ApiProperty } from "@nestjs/swagger";
import { InflowFilter } from "src/database/enums/historicalDashboardInflowFilter.enum";
import { PaginationRequestDto } from "../request/PaginationRequest.dto";
import { ActiveHiringProcessFieldDto } from "./ActiveHiringProcessField.dto";
export class ActiveHiringProcessDto{
    
    @ApiProperty({ description:'Pagination info of the active hiring process section'})
    paginationInfo: PaginationRequestDto;

    
    @ApiProperty({ description:'Data of the active hiring process section'})
    activeHiringFields: ActiveHiringProcessFieldDto[];

    
}