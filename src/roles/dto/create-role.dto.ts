import { IsString, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString({ message: 'Solo se permiten letras en el campo de departamento.' })
  @MinLength(3, {
    message: "El campo 'departamento' debe tener 3 o mas caracteres",
  })
  nombre: string;

  @IsString({ message: 'Solo se permiten letras en el campo de pais.' })
  @MinLength(3, {
    message: "El campo 'departamento' debe tener 3 o mas caracteres",
  })
  pais: string;
}
