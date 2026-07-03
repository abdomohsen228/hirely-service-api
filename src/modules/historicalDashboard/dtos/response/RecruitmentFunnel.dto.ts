import { ApiProperty } from "@nestjs/swagger";
import { describe } from "node:test";

export class RecruitmentFunnel{

    @ApiProperty({description:'Num of applications made'})
    applications:number;

    @ApiProperty({description:'Num of cv screened applications'})
    screened:number;

    @ApiProperty({description:'Num of interviewed applications'})
    interviewed:number;

    @ApiProperty({description:'Num of accepted applications'})
    hired:number;

    @ApiProperty({description:'Percentage of applications hired directly from cv'})
    cv_to_hire:number;

    @ApiProperty({description:'Percentage of applications hired from interview'})
    interview_to_hire:number;

   


}