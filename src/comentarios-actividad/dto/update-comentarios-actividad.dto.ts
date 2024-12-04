import { PartialType } from '@nestjs/mapped-types';
import { CreateComentarioDto } from './create-comentarios-actividad.dto';

export class UpdateComentariosActividadDto extends PartialType(
  CreateComentarioDto
) {}
