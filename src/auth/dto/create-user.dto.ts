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
  IsOptional,
} from 'class-validator';

export class CreateUserDto {
  @IsString({ message: "El Campo 'nombre' solo debe contener letras" })
  @MinLength(3, { message: "El campo 'nombre' debe contener 3 o más letras" })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'El campo nombre solo acepta letras y espacios en blanco',
  })
  nombre: string;

  @IsEmail()
  @Matches(
    /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/,
    { message: "EL campo 'correo' no cuenta con el formato correspondiente" }
  )
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

  @IsString({ message: "El Campo 'pais' solo debe contener letras" })
  @MinLength(3, { message: "El campo 'pais' debe contener 3 o más letras" })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'El campo nombre solo acepta letras y espacios en blanco',
  })
  pais: string;

  @IsString({ message: "El Campo 'empresa' solo debe contener letras" })
  @MinLength(3, { message: "El campo 'empresa' debe contener 3 o más letras" })
  @Matches(/^[a-zA-Z\s]+$/, {
    message: 'El campo nombre solo acepta letras y espacios en blanco',
  })
  empresa: string;

  @IsString({ message: "El campo 'DNI' debe ser una cadena de texto" })
  @Matches(/^(\d{8}-\d|\d{4}-\d{4}-\d{5})$/, {
    message:
      'El número de identificación debe tener el formato xxxxxxxx-x o xxxx-xxxx-xxxxx',
  })
  dni: string;

  @IsString({ message: "El campo 'direccion' solo acepta letras" })
  @MaxLength(100, {
    message: "El campo 'direccion' no puede exceder los 100 caracteres",
  })
  @MinLength(2, {
    message: "El campo 'direccion' no puede tener menos de 2 caracteres",
  })
  direccion: string;

  @IsString({ message: "El campo 'rol' debe ser de tipo string" })
  @IsOptional()
  roleId?: string;

  @IsString({ message: "El campo 'sucursal' debe ser de tipo string" })
  @IsOptional()
  sucursalId?: string;
}
