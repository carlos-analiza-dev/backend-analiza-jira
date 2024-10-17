import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateActividadeDto {
  @IsString({ message: 'Solo se permiten letras en el campo' })
  @IsNotEmpty()
  titulo: string;

  @IsString({ message: 'Solo se permiten letras en el campo' })
  @IsNotEmpty()
  descripcion: string;

  @IsEnum(['Nueva', 'Recibida', 'EnProgreso', 'Finalizada'])
  @IsOptional()
  estado?: string;

  @IsUUID()
  @IsNotEmpty()
  usuarioAsignado: string;

  @IsUUID()
  @IsNotEmpty()
  eventoId: string;
}
