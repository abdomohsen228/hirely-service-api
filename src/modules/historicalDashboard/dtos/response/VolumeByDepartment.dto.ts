import { ApiProperty } from "@nestjs/swagger";
import { InflowFilter } from "src/database/enums/historicalDashboardInflowFilter.enum";
import { PaginationRequestDto } from "../request/PaginationRequest.dto";
import { DepartmetFieldDto } from "./DepartmentField.dto";
export class VolumeByDepartmentDto{
    
    @ApiProperty({ description:'Pagination information of the department section'})
    department_pagination: PaginationRequestDto;

    @ApiProperty({ description:'The actual data used to describe the departmet section'})
    departmentData: DepartmetFieldDto[];


}