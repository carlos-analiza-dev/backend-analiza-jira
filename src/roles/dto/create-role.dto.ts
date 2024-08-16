import { IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'Solo se permiten letras en el campo de rol.' })
  @MinLength(3, { message: "El campo 'rol' debe tener 3 o mas caracteres" })
  nombre: string;
}
