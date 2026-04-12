import { PartialType } from '@nestjs/swagger';
import { CreateEducationRequestDto } from './createEducation.request.dto';

export class UpdateEducationRequestDto extends PartialType(
  CreateEducationRequestDto,
) {}
