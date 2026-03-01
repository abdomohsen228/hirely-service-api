import { ApiProperty } from '@nestjs/swagger';
import { CompanyIndustry } from 'src/database/enums/companyIndustry.enum';
import { CompanySize } from 'src/database/enums/companySize.enum';

export class CompleteHrRegistrationResponseDto {
  @ApiProperty({ example: 'Ahmed Salah' })
  fullName: string;

  @ApiProperty({ example: 'ahmed' })
  username: string;

  @ApiProperty({ example: '+201012345678' })
  phoneNumber: string;

  @ApiProperty({ example: 'TechCorp' })
  companyName: string;

  @ApiProperty({ example: 'https://techcorp.com', required: false })
  companyWebsite?: string;

  @ApiProperty({
    example: 'Leading technology solutions provider...',
    required: false,
  })
  companySummary?: string;

  @ApiProperty({ enum: CompanySize, required: false })
  companySize?: CompanySize;

  @ApiProperty({ enum: CompanyIndustry, required: false })
  companyIndustry?: CompanyIndustry;

  @ApiProperty({ example: 'HR Manager', required: false })
  jobTitle?: string;

  @ApiProperty({ example: 'ACTIVE' })
  accountStatus: string;

  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT access token for authenticated HR user',
  })
  accessToken: string;
}
