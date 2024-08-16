import { IsString, MinLength } from 'class-validator';

export class CreateSucursalDto {
  @IsString({ message: 'Solo se permiten letras en el campo de sucursal.' })
  @MinLength(3, {
    message: "El campo 'sucursal' debe tener 3 o mas caracteres",
  })
  name: string;

  @IsString({ message: 'Solo se permiten letras en el campo de departamento.' })
  @MinLength(3, {
    message: "El campo 'departamento' debe tener 3 o mas caracteres",
  })
  departamento: string;
}
