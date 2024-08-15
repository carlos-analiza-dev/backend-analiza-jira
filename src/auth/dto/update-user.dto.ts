import {
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  nombre?: string;

  @IsEmail()
  @IsOptional()
  correo?: string;

  @IsString()
  @IsOptional()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsOptional()
  sexo?: string;

  @IsInt()
  @IsOptional()
  edad?: number;

  @IsString()
  @IsOptional()
  dni?: string;

  @IsString()
  @IsOptional()
  direccion?: string;

  @IsNumber()
  @IsOptional()
  autorizado?: boolean;

  @IsNumber()
  @IsOptional()
  isActive?: boolean;
}
