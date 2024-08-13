import {
  IsEmail,
  IsNumber,
  IsPositive,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  Min,
  Max,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: "El Campo 'nombre' solo debe contener letras" })
  @MinLength(3, { message: "El campo 'nombre' debe contener 3 o más letras" })
  nombre: string;

  @IsEmail()
  correo: string;

  @MinLength(6, {
    message: 'La contraseña debe contener un mínimo de 6 caracteres',
  })
  @MaxLength(50, {
    message: 'La contraseña no puede exceder los 50 caracteres',
  })
  @Matches(/(?:(?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'La contraseña debe tener una letra mayúscula, minúscula y un número.',
  })
  password: string;

  @IsString({ message: "El campo 'sexo' debe contener solo letras" })
  @MinLength(1, { message: "El campo 'sexo' es demasiado corto" })
  sexo: string;

  @IsNumber()
  @IsPositive({
    message: "El campo 'edad' no puede contener números negativos",
  })
  @Min(1, { message: "El campo 'edad' debe ser mayor o igual a 1" })
  @Max(120, { message: 'El campo edad no puede ser mayor a 120' })
  edad: number;

  @IsString({ message: "El campo 'DNI' debe ser una cadena de texto" })
  @MinLength(13, { message: "El campo 'DNI' debe tener 13 caracteres" })
  @MaxLength(13, { message: 'El campo DNI no puede exceder 13 caracteres' })
  dni: string;

  @IsString({ message: "El campo 'direccion' solo acepta letras" })
  @MaxLength(100, {
    message: "El campo 'direccion' no puede exceder los 100 caracteres",
  })
  direccion: string;
}