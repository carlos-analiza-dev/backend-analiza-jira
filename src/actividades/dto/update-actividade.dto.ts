import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateActividadeDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @Type(() => Date)
  @IsDate({ message: 'fecha de Inicio debe ser una fecha válida' })
  @IsOptional()
  fechaInicio?: Date;

  @Type(() => Date)
  @IsDate({ message: 'fecha Finalizacion debe ser una fecha válida' })
  @IsOptional()
  fechaFin?: Date;

  @IsEnum(['Nueva', 'Recibida', 'EnProgreso', 'Finalizada'])
  @IsOptional()
  estado?: string;

  @IsEnum(['Baja', 'Media', 'Alta', 'Critica'])
  @IsOptional()
  prioridad?: string;
}
