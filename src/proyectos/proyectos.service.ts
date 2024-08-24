import { Injectable } from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';

@Injectable()
export class ProyectosService {
  create(createProyectoDto: CreateProyectoDto) {
    return 'This action adds a new proyecto';
  }

  findAll() {
    return `This action returns all proyectos`;
  }

  findOne(id: number) {
    return `This action returns a #${id} proyecto`;
  }

  update(id: number, updateProyectoDto: UpdateProyectoDto) {
    return `This action updates a #${id} proyecto`;
  }

  remove(id: number) {
    return `This action removes a #${id} proyecto`;
  }
}
