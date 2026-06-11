import { ApiProperty } from "@nestjs/swagger";
export class MatchScoreDataDto {
    @ApiProperty({ example: 85, description: '0–100 match score for the application' })
    matchScore: number;
}