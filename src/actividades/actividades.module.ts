import { Module } from '@nestjs/common';
import { ActividadesService } from './actividades.service';
import { ActividadesController } from './actividades.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Actividade } from './entities/actividade.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Evento } from 'src/evento/entities/evento.entity';

@Module({
  controllers: [ActividadesController],
  providers: [ActividadesService],
  imports: [TypeOrmModule.forFeature([Actividade, Evento]), AuthModule],
})
export class ActividadesModule {}
