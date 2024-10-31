import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

export class CreateEmpresaDto {
  @IsString({ message: 'El campo nombre de empresa solo permite letras' })
  @IsNotEmpty()
  @Matches(/^[a-zA-Z\s]+$/, {
    message:
      'El campo nombre de empresa solo acepta letras y espacio en blanco',
  })
  nombre: string;

  @IsString({ message: 'El campo descripcion de empresa solo permite letras' })
  @IsNotEmpty()
  @Matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s.,;:()\-]+$/, {
    message: 'El campo descripcion de empresa no cumple con los requisitos.',
  })
  descripcion: string;

  @IsOptional()
  @IsEnum(['Activa', 'Inactiva'], {
    message: 'El estado debe ser Activa o Inactiva',
  })
  estado?: string;
}
