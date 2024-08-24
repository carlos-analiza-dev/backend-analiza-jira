import { Module } from '@nestjs/common';
import { ProyectosService } from './proyectos.service';
import { ProyectosController } from './proyectos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Tarea } from 'src/tareas/entities/tarea.entity';

@Module({
  controllers: [ProyectosController],
  providers: [ProyectosService],
  imports: [TypeOrmModule.forFeature([User, Tarea])],
})
export class ProyectosModule {}
