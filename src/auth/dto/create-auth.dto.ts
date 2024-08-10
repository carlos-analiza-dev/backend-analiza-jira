import {
  IsBoolean,
  IsEmail,
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAuthDto {
  @IsString({ message: "El Campo 'nombre' solo debe contener letras" })
  @MinLength(3, { message: 'El campo nombre debe contener 3 o mas letras' })
  nombre: string;
  @IsEmail()
  correo: string;
  @IsString({
    message: "El campo 'sexo' debe contener solo debe contener letras",
  })
  @MinLength(1, { message: "El campo 'sexo' excede la longitud de caracteres" })
  sexo: string;
  @IsNumber()
  @IsPositive({
    message: "El campo 'edad' no puede contener numeros negativos",
  })
  @MinLength(1, { message: "El campo 'edad' no valido" })
  @MaxLength(3, { message: 'El campo edad execede la longitud permitida' })
  edad: number;
  @IsNumber()
  @MinLength(13, {
    message: "El campo 'DNI' no puede tener menos de 13 caracteres",
  })
  @MaxLength(13, { message: 'El campo DNI no puede execeder 13 caracteres' })
  dni: string;
  @IsString({ message: "El campo 'direccion' solo acepta letras" })
  @MaxLength(50, {
    message: "El campo 'direccion no puede exceder los 50 caracteres'",
  })
  direccion: string;
  @IsBoolean({ message: 'Formato de campo invalido' })
  isActive: boolean;
}
