import { PartialType } from '@nestjs/swagger';
import { CreateExperienceRequestDto } from './createExperience.request.dto';

export class UpdateExperienceRequestDto extends PartialType(
  CreateExperienceRequestDto,
) {}
