import { Module } from '@nestjs/common';
import { EmpresaService } from './empresa.service';
import { EmpresaController } from './empresa.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Empresa } from './entities/empresa.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [EmpresaController],
  providers: [EmpresaService],
  imports: [TypeOrmModule.forFeature([Empresa]), AuthModule],
})
export class EmpresaModule {}
