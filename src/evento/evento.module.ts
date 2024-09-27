import { Module } from '@nestjs/common';
import { EventoService } from './evento.service';
import { EventoController } from './evento.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';

@Module({
  controllers: [EventoController],
  providers: [EventoService],
  imports: [TypeOrmModule.forFeature([Evento, User]), AuthModule],
})
export class EventoModule {}
