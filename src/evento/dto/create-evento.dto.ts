import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEventoDto {
  @IsString({ message: 'Solo se aceptan letras en el nombre del evento' })
  @IsNotEmpty({ message: 'El nombre del evento es obligatorio' })
  nombre: string;

  @IsString({ message: 'Solo se aceptan letras en la descripcion del evento' })
  @IsNotEmpty({ message: 'La descripcion es obligatoria' })
  descripcion: string;

  @Type(() => Date)
  @IsDate({ message: 'fecha de Inicio debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de inicio es obligatoria' })
  fechaInicio: Date;

  @Type(() => Date)
  @IsDate({ message: 'fecha Finalizacion debe ser una fecha válida' })
  @IsNotEmpty({ message: 'La fecha de finalizacion es obligatoria' })
  fechaFin: Date;

  @IsNotEmpty({ message: 'El tipo de evento es obligatorio' })
  @IsEnum(['Conferencia', 'Seminario', 'Festivo', 'Virtual'])
  tipoEvento: string;

  @IsOptional()
  @IsEnum(['Activo', 'Cancelado', 'Pospuesto'])
  estado?: string;
}
