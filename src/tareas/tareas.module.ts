import { Module } from '@nestjs/common';
import { TareasService } from './tareas.service';
import { TareasController } from './tareas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';

@Module({
  controllers: [TareasController],
  providers: [TareasService],
  imports: [TypeOrmModule.forFeature([User, Proyecto])],
})
export class TareasModule {}