import { ApiBearerAuth, ApiProperty } from '@nestjs/swagger';
export class CandidateDataDto {
    @ApiProperty()
    candidateId: string;

    @ApiProperty()
    name: string;

    @ApiProperty()
    role: string;

}
