import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateActividadeDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(['Nueva', 'Recibida', 'EnProgreso', 'Finalizada'])
  @IsOptional()
  estado?: string;
}
