import { Type } from 'class-transformer';
import { IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  @IsOptional()
  @IsString()
  sexo?: string;

  @IsOptional()
  @IsString()
  departamento?: string;

  @IsOptional()
  @IsString()
  tipoEvento?: string;

  @IsOptional()
  @IsString()
  estado?: string;

  @IsOptional()
  @IsString()
  sucursal?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  correo?: string;
}
