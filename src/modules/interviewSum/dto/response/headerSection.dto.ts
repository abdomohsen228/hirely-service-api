import { ApiProperty } from '@nestjs/swagger';

export class HeaderSectionDto {
    @ApiProperty()
    interviewDuration: number;

    @ApiProperty()
    interviewDate: Date;

    @ApiProperty()
    title: string;
}
