import { IsEmail, IsNotEmpty } from 'class-validator';

export class SendMailDto {
  @IsEmail()
  @IsNotEmpty()
  correo: string;
}
