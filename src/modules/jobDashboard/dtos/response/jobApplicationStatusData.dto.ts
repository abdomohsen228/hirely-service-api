import { ApiProperty } from "@nestjs/swagger";
import { IsAlpha, IsEnum } from "class-validator";
import { ApplicationStatus } from "src/database/enums/applicationStatus.enum";

export class JobApplicationStatusDataDto {
    @ApiProperty({ example: ApplicationStatus.ACCEPTED, description: 'The status of the job application' })
    @IsEnum(ApplicationStatus)
    applicationStatus: ApplicationStatus;
}