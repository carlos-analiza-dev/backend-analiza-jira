import { IsEnum, IsOptional, IsString } from 'class-validator';

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
  fechaCreacion?: string;

  @IsOptional()
  id?: string;

  @IsOptional()
  creador?: {};
}
