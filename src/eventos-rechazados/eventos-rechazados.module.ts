import { Module } from '@nestjs/common';
import { EventosRechazadosService } from './eventos-rechazados.service';
import { EventosRechazadosController } from './eventos-rechazados.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventosRechazado } from './entities/eventos-rechazado.entity';
import { User } from 'src/auth/entities/user.entity';
import { Evento } from 'src/evento/entities/evento.entity';

@Module({
  controllers: [EventosRechazadosController],
  imports: [TypeOrmModule.forFeature([EventosRechazado, User, Evento])],
  providers: [EventosRechazadosService],
})
export class EventosRechazadosModule {}
