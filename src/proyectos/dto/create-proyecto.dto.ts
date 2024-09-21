import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateProyectoDto {
  @IsNotEmpty()
  @IsString({ message: 'El campo nombre solo permite letras' })
  nombre: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo cliente solo permite letras' })
  cliente: string;

  @IsNotEmpty()
  @IsString({ message: 'El campo descripcion solo permite letras' })
  descripcion: string;

  @IsOptional()
  @IsEnum(['En Progreso', 'Finalizado'])
  estado?: string;

  @IsOptional()
  @IsUUID()
  responsableId?: string;
}
