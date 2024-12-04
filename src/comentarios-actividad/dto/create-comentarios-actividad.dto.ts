import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateComentarioDto {
  @IsString({ message: 'Solo se permiten letras en el campo contenido' })
  @IsNotEmpty()
  contenido: string;

  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
