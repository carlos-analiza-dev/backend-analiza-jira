import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursal } from './entities/sucursal.entity';

@Module({
  controllers: [SucursalController],
  providers: [SucursalService],
  imports: [TypeOrmModule.forFeature([Sucursal])],
})
export class SucursalModule {}
