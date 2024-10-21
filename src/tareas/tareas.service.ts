import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Tarea } from './entities/tarea.entity';
import { Repository } from 'typeorm';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';

@Injectable()
export class TareasService {
  constructor(
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>,

    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,

    @InjectRepository(User)
    private readonly userReposiyory: Repository<User>
  ) {}
  async create(createTareaDto: CreateTareaDto, user: User) {
    const { titulo, descripcion, estado, proyectoId, usuarioAsignado } =
      createTareaDto;

    const proyectoEncontrado = await this.proyectoRepository.findOne({
      where: { id: proyectoId },
    });

    if (!proyectoEncontrado) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const usuarioEncontrado = await this.userReposiyory.findOne({
      where: { id: usuarioAsignado },
    });

    if (!usuarioEncontrado) {
      throw new NotFoundException('Usuario no encontrado');
    }
    try {
      const nuevaTarea = this.tareaRepository.create({
        titulo,
        descripcion,
        estado,
        proyecto: proyectoEncontrado,
        creador: user,
        usuarioAsignado: usuarioEncontrado,
      });
      return this.tareaRepository.save(nuevaTarea);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      const tareasProyectId = await this.tareaRepository.find({});
      if (!tareasProyectId || tareasProyectId.length === 0)
        throw new NotFoundException('No se encontraron tareas');
      return tareasProyectId;
    } catch (error) {
      throw error;
    }
  }

  async findAllTareasByProyectoId(proyectoId: string) {
    try {
      const proyecto = await this.proyectoRepository.findOne({
        where: { id: proyectoId },
        relations: ['tareas'],
      });

      if (!proyecto) {
        throw new NotFoundException('Proyecto no encontrado');
      }

      return proyecto.tareas;
    } catch (error) {
      throw new Error('Hubo un problema al obtener las tareas del proyecto');
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} tarea`;
  }

  async update(id: string, updateTareaDto: UpdateTareaDto, user: User) {
    const tarea = await this.tareaRepository.findOne({ where: { id } });
    if (!tarea) {
      throw new NotFoundException('Tarea no encontrada');
    }

    Object.assign(tarea, updateTareaDto);
    tarea.actualizadoPor = user;
    return this.tareaRepository.save(tarea);
  }

  async remove(id: string) {
    const deleteTask = await this.tareaRepository.findOne({ where: { id } });
    try {
      if (!deleteTask)
        throw new NotFoundException(
          'No se encontro la tarea que deseas a eliminar'
        );
      await this.tareaRepository.remove(deleteTask);
      return 'Tarea eliminada exitosamente';
    } catch (error) {
      throw error;
    }
  }
}
