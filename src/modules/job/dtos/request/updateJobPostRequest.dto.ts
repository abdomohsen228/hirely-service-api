import { PartialType } from '@nestjs/swagger';
import { CreateJobPostRequestDto } from './createJobPostRequest.dto';

export class UpdateJobPostRequestDto extends PartialType(
  CreateJobPostRequestDto,
) {}
