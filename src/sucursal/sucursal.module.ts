import { Module } from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { SucursalController } from './sucursal.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Sucursal } from './entities/sucursal.entity';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/auth/entities/user.entity';

@Module({
  controllers: [SucursalController],
  providers: [SucursalService],
  imports: [TypeOrmModule.forFeature([Sucursal, User]), AuthModule],
})
export class SucursalModule {}
