import { IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateTareaDto {
  @IsString()
  @IsOptional()
  titulo?: string;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsEnum(['Nueva', 'EnProgreso', 'Finalizada'])
  @IsOptional()
  estado?: string;
}
