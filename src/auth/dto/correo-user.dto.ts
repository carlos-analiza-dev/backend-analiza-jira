import { IsEmail, IsString } from 'class-validator';

export class CorreoDto {
  @IsEmail({}, { message: 'Correo electrónico inválido' })
  correo: string;
}
