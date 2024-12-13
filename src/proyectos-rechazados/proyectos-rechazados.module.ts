import { Module } from '@nestjs/common';
import { ProyectosRechazadosService } from './proyectos-rechazados.service';
import { ProyectosRechazadosController } from './proyectos-rechazados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProyectosRechazado } from './entities/proyectos-rechazado.entity';
import { User } from 'src/auth/entities/user.entity';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';

@Module({
  controllers: [ProyectosRechazadosController],
  imports: [TypeOrmModule.forFeature([ProyectosRechazado, User, Proyecto])],
  providers: [ProyectosRechazadosService],
})
export class ProyectosRechazadosModule {}
