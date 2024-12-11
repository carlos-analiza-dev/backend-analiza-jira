import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateProyectoDto {
  @IsOptional()
  @IsString({ message: 'El campo nombre solo permite letras' })
  nombre?: string;

  @IsOptional()
  @IsString({ message: 'El campo cliente solo permite letras' })
  cliente?: string;

  @IsOptional()
  @IsString({ message: 'El campo descripcion solo permite letras' })
  descripcion?: string;

  @IsOptional()
  @IsEnum(['En Progreso', 'Finalizado'])
  estado?: string;

  @IsOptional()
  @IsEnum(['Pendiente', 'Rechazado', 'Aceptado'])
  statusProject?: string;

  @IsOptional()
  @IsString({ message: 'El campo descripcion solo permite letras' })
  justificacion?: string;

  @IsOptional()
  fechaCreacion?: string;

  @IsOptional()
  id?: string;

  @IsOptional()
  @IsUUID()
  creador?: {};

  @IsOptional()
  @IsUUID()
  responsableId?: string;
}
