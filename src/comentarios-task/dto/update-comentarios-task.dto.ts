import { PartialType } from '@nestjs/mapped-types';
import { CreateComentarioDto } from './create-comentarios-task.dto';

export class UpdateComentariosTaskDto extends PartialType(
  CreateComentarioDto
) {}
