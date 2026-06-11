import { ApiOperation, ApiParam, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { IsNotEmpty, IsString, isEnum } from 'class-validator';
import { ApplicationStatus } from 'src/database/enums/applicationStatus.enum';
export class UpdateJobDashboardApplicationRequestDto {
    @ApiProperty({ example: ApplicationStatus.SHORTLISTED, description: 'The new status of the job application' })
    @IsString()
    @IsNotEmpty()
    applicationStatus: ApplicationStatus;
}