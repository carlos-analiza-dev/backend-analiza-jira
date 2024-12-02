import { Injectable } from '@nestjs/common';

import { UpdateComentariosTaskDto } from './dto/update-comentarios-task.dto';
import { CreateComentarioDto } from './dto/create-comentarios-task.dto';

@Injectable()
export class ComentariosTaskService {
  create(createComentariosTaskDto: CreateComentarioDto) {
    return 'This action adds a new comentariosTask';
  }

  findAll() {
    return `This action returns all comentariosTask`;
  }

  findOne(id: number) {
    return `This action returns a #${id} comentariosTask`;
  }

  update(id: number, updateComentariosTaskDto: UpdateComentariosTaskDto) {
    return `This action updates a #${id} comentariosTask`;
  }

  remove(id: number) {
    return `This action removes a #${id} comentariosTask`;
  }
}
