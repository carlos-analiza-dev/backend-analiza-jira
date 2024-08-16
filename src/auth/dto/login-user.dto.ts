import { IsEmail, Matches, MaxLength, MinLength } from 'class-validator';

export class LoginUserDto {
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
}
