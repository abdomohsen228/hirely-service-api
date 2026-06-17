import { ApiProperty } from "@nestjs/swagger";
export class DashboardHeaders{
    @ApiProperty({ example: '1000', description: 'Number of overall total applications recieved for Hr past roles'})
    totalApplications: number;

    @ApiProperty({ example: '12', description: ' The percentage of change from last month'})
    totalApplications_analysis: number;


    @ApiProperty({ example: '17.3', description: 'The rate of interviews made for the applications recieved'})
    interviewRate: number;

    @ApiProperty({ example: '15', description: 'The standard baseline of the interview rate'})
    interviewRate_baseline: number;


    @ApiProperty({ example: '20', description: 'The avg time needed to hire a candidate'})
    tthire: number;

    @ApiProperty({ example: '2', description: 'The difference in avg time needed to hire a candidate between this month and past month'})
    tthire_analysis: number;

    @ApiProperty({ example: '20', description: 'The percentage of model accuracy'})
    modelEfficiency: number;
}