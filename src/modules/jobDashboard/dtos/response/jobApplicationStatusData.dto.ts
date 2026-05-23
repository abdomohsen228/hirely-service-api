import { ApiProperty } from "@nestjs/swagger";
import { ApplicationStatus } from "src/database/enums/applicationStatus.enum";

export class JobApplicationStatusDataDto {
    @ApiProperty({ example: ApplicationStatus.ACCEPTED, description: 'The status of the job application' })
    applicationStatus: ApplicationStatus;
}