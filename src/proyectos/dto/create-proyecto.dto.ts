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
  @IsEnum(['Pendiente', 'Rechazado', 'Aceptado'])
  statusProject?: string;

  @IsOptional()
  @IsString({ message: 'El campo descripcion solo permite letras' })
  justificacion?: string;

  @IsNotEmpty({ message: 'El responsable del proyecto el obligatorio' })
  @IsUUID()
  responsableId: string;

  @IsNotEmpty({ message: 'El departamento del proyecto el obligatorio' })
  @IsUUID()
  rolDirigido: string;
  @IsNotEmpty({ message: 'La empresa del proyecto el obligatorio' })
  @IsUUID()
  empresaId: string;
}
