import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly pryectoRespository: Repository<Proyecto>
  ) {}
  async create(createProyectoDto: CreateProyectoDto, user: User) {
    const { nombre, cliente, descripcion, estado } = createProyectoDto;
    try {
      const proyecto = this.pryectoRespository.create({
        nombre: nombre,
        cliente: cliente,
        descripcion: descripcion,
        estado: estado,
        creador: user,
      });
      if (!proyecto) {
        throw new BadRequestException('Ocurrio un error al crear el proyecto');
      }
      await this.pryectoRespository.save(proyecto);
      return proyecto;
    } catch (error) {
      console.log(error);
    }
  }

  async findAll(user: User) {
    try {
      const proyectos = await this.pryectoRespository.find({
        where: { creador: user.proyectosCreados },
      });
      if (!proyectos || proyectos.length === 0)
        throw new NotFoundException('No se encontraron proyectos');
      return proyectos;
    } catch (error) {
      console.log(error);
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} proyecto`;
  }

  update(id: string, updateProyectoDto: UpdateProyectoDto) {
    return `This action updates a #${id} proyecto`;
  }

  remove(id: string) {
    return `This action removes a #${id} proyecto`;
  }

  private handleError(error: any) {}
}
