import { ApiBearerAuth, ApiProperty, ApiResponse, ApiTags } from '@nestjs/swagger';

export class JobApplicationResponseDto {
  @ApiProperty({ example: '12345', description: 'Unique identifier for the application' })
  applicationId: string;

  @ApiProperty({ example: 'John Doe', description: 'Name of the candidate' })
  candidateName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address of the candidate' })
  candidateEmail: string;

  @ApiProperty({ example: '2023-10-01', description: 'Date when the application was submitted' })
  applicationDate: string;

  @ApiProperty({ example: 'Pending', description: 'Current status of the application' })
  applicationStatus: string;

  
}