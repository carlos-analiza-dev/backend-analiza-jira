import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateTareaDto {
  @IsString({ message: 'Solo se permiten letras en el campo' })
  @IsNotEmpty()
  titulo: string;

  @IsString({ message: 'Solo se permiten letras en el campo' })
  @IsNotEmpty()
  descripcion: string;

  @IsEnum(['Nueva', 'Recibida', 'EnProgreso', 'Finalizada'])
  @IsOptional()
  estado?: string;

  @Type(() => Date)
  @IsDate({ message: 'fecha de Inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fechaInicio: Date;

  @Type(() => Date)
  @IsDate({ message: 'fecha Finalizacion debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de finalizacion es obligatoria' })
  fechaFin: Date;

  @IsUUID()
  @IsNotEmpty()
  proyectoId: string;

  @IsString()
  @IsOptional()
  tareaDependenciaId?: string;

  @IsUUID()
  @IsNotEmpty()
  usuarioAsignado: string;
}
