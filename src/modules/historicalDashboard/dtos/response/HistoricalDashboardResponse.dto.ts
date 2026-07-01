import { ApiProperty } from "@nestjs/swagger";
import { DashboardHeaders } from "./DashboardHeade4rs.dto";
import { RecruitmentFunnel } from "./RecruitmentFunnel.dto";
import { ApplicationInflowTrendDto } from "./ApplicationInflowTrend.dto";
import { VolumeByDepartmentDto } from "./VolumeByDepartment.dto";
import { ActiveHiringProcessDto } from "./ActiveHiringProcess.dto";
export class HistoricalDashboardResponseDto{
    
    @ApiProperty({ description:'the headers section of the dashboard'})
    headers: DashboardHeaders;

    @ApiProperty({ description:'the recruitement funnel section of the dashboard'})
    recruitement_funnel: RecruitmentFunnel;
    
    @ApiProperty({ description:'the application trend section of the dashboard'})
    inflow_trend: ApplicationInflowTrendDto;

    @ApiProperty({ description:'the volume by department section of the dashboard'})
    volume_by_department: VolumeByDepartmentDto;

    @ApiProperty({ description:'the active hiring process section of the dashboard'})
    active_hiring_process: ActiveHiringProcessDto;
    
}