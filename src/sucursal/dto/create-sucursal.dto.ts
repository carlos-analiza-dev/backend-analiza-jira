import { IsString, MinLength } from 'class-validator';

export class CreateSucursalDto {
  @IsString({ message: 'Solo se permiten letras en el campo de sucursal.' })
  @MinLength(3, {
    message: "El campo 'sucursal' debe tener 3 o mas caracteres",
  })
  nombre: string;

  @IsString({ message: 'Solo se permiten letras en el campo de departamento.' })
  @MinLength(3, {
    message: "El campo 'departamento' debe tener 3 o mas caracteres",
  })
  departamento: string;

  @IsString({ message: 'Solo se permiten letras en el campo de pais.' })
  @MinLength(3, {
    message: "El campo 'pais' debe tener 3 o mas caracteres",
  })
  pais: string;

  @IsString({ message: 'Solo se permiten letras en el campo de direccion.' })
  @MinLength(3, {
    message: "El campo 'direccion' debe tener 3 o mas caracteres",
  })
  direccion: string;
}
