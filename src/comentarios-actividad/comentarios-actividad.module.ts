import { Module } from '@nestjs/common';
import { ComentariosActividadService } from './comentarios-actividad.service';
import { ComentariosActividadController } from './comentarios-actividad.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComentariosActividad } from './entities/comentarios-actividad.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ComentariosActividadController],
  imports: [TypeOrmModule.forFeature([ComentariosActividad]), AuthModule],
  providers: [ComentariosActividadService],
})
export class ComentariosActividadModule {}
