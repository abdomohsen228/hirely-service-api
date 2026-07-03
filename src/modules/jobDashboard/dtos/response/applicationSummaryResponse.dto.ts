import { IsString } from 'class-validator';

export class ApplicationSummaryResponseDto {
    @IsString()
    applicationSummary: string;
}
