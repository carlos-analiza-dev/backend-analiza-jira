import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateEventosRechazadoDto {
  @IsUUID('4', { message: 'El ID del proyecto debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del proyecto es obligatorio' })
  eventoId: string;

  @IsUUID('4', { message: 'El ID del usuario debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El ID del usuario es obligatorio' })
  usuarioId: string;

  @IsString({ message: 'El motivo debe ser una cadena de texto' })
  @IsOptional()
  motivo?: string;
}
