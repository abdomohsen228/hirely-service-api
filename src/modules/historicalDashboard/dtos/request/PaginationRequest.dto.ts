import { ApiProperty } from "@nestjs/swagger";
import { IsOptional,IsNotEmpty, IsString } from "class-validator";
export class PaginationRequestDto{

    @ApiProperty({ example: 1, description: 'The page number for pagination', required: false })
    @IsOptional()
    @IsNotEmpty()
    page?: number;

    @ApiProperty({ example: 10, description: 'The number of items per page for pagination', required: false })
    @IsOptional()
    @IsNotEmpty()
    limit?: number;

    @ApiProperty({ example: 10, description: 'The total number of pages', required: false })
    @IsOptional()
    @IsNotEmpty()
    total?: number;


}