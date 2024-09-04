import {
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

  @IsEnum(['Nueva', 'EnProgreso', 'Finalizada'])
  @IsOptional()
  estado?: string;

  @IsUUID()
  @IsNotEmpty()
  proyectoId: string;
}
