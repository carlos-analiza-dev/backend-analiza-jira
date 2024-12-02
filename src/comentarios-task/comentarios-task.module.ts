import { Module } from '@nestjs/common';
import { ComentariosTaskService } from './comentarios-task.service';
import { ComentariosTaskController } from './comentarios-task.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comentario } from './entities/comentarios-task.entity';

@Module({
  controllers: [ComentariosTaskController],
  imports: [TypeOrmModule.forFeature([Comentario])],
  providers: [ComentariosTaskService],
})
export class ComentariosTaskModule {}
