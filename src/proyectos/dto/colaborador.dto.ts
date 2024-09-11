import { IsString, IsUUID } from 'class-validator';

export class ColaboradorDTO {
  @IsString()
  @IsUUID()
  userId: string;
}
