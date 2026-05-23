import { ApiProperty } from "@nestjs/swagger";

export class VisualIndicatorsDataDto {
    @ApiProperty({ example: 70, description: 'Indicates the candidate\'s CV rank' })
    cvRank: number;

    @ApiProperty({ example: 70, description: 'Indicates the candidate\'s English proficiency level' })
    english: number;

    @ApiProperty({ example: 70, description: 'Indicates the candidate\'s body language score' })
    bodyLanguage: number;
}