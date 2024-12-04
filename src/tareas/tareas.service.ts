import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
    const {
      titulo,
      descripcion,
      estado,
      proyectoId,
      usuarioAsignado,
      tareaDependenciaId,
      fechaFin,
      fechaInicio,
      prioridad,
    } = createTareaDto;

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

    const startDate = new Date(createTareaDto.fechaInicio);
    const endDate = new Date(createTareaDto.fechaFin);
    const currentDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (startDate > endDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior a la fecha de fin.'
      );
    }

    if (startDate < currentDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser menor que la fecha actual.'
      );
    }

    if (endDate < currentDate) {
      throw new BadRequestException(
        'La fecha de Finalización no puede ser menor que la fecha actual.'
      );
    }

    let tareaDependenciaEncontrada = null;

    // Solo busca la tarea dependiente si el ID fue proporcionado
    if (tareaDependenciaId) {
      tareaDependenciaEncontrada = await this.tareaRepository.findOne({
        where: { id: tareaDependenciaId },
      });

      if (!tareaDependenciaEncontrada) {
        throw new NotFoundException('Tarea dependiente no encontrada');
      }
    }

    try {
      const nuevaTarea = this.tareaRepository.create({
        titulo,
        descripcion,
        estado,
        prioridad,
        proyecto: proyectoEncontrado,
        creador: user,
        usuarioAsignado: usuarioEncontrado,
        tareaDependencia: tareaDependenciaEncontrada || null,
        fechaFin,
        fechaInicio,
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

  async findAllTareaId(tareaId: string) {
    try {
      const tarea = await this.tareaRepository.findOne({
        where: { id: tareaId },
      });
      if (!tarea) throw new NotFoundException('No se encontro la tarea.');
      return tarea;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateTareaDto: UpdateTareaDto, user: User) {
    try {
      const tarea = await this.tareaRepository.findOne({
        where: { id },
        relations: ['tareaDependencia'],
      });

      if (!tarea) {
        throw new NotFoundException('Tarea no encontrada');
      }

      const startDate = new Date(updateTareaDto.fechaInicio);
      const endDate = new Date(updateTareaDto.fechaFin);
      const currentDate = new Date();

      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      currentDate.setHours(0, 0, 0, 0);

      if (startDate > endDate) {
        throw new BadRequestException(
          'La fecha de inicio no puede ser posterior a la fecha de fin.'
        );
      }

      if (startDate < currentDate) {
        throw new BadRequestException(
          'La fecha de inicio no puede ser menor que la fecha actual.'
        );
      }

      if (endDate < currentDate) {
        throw new BadRequestException(
          'La fecha de Finalización no puede ser menor que la fecha actual.'
        );
      }

      if (startDate > currentDate) {
        throw new BadRequestException(
          'La fecha de Inicio no puede ser mayor que la fecha actual.'
        );
      }

      // Validación adicional para tarea dependiente
      if (
        tarea.tareaDependencia &&
        tarea.tareaDependencia.estado !== 'Finalizada' &&
        updateTareaDto.estado !== undefined
      ) {
        const nombreDependencia =
          tarea.tareaDependencia.titulo || 'tarea dependiente';
        throw new BadRequestException(
          `No se puede cambiar el estado porque la tarea de la que depende (${nombreDependencia}) no está finalizada`
        );
      }

      Object.assign(tarea, updateTareaDto);
      tarea.actualizadoPor = user;

      return await this.tareaRepository.save(tarea);
    } catch (error) {
      throw error; // Lanzar el error capturado
    }
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
