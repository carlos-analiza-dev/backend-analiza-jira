import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateActividadeDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';
import { User } from 'src/auth/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Actividade } from './entities/actividade.entity';
import { Repository } from 'typeorm';
import { Evento } from 'src/evento/entities/evento.entity';

@Injectable()
export class ActividadesService {
  constructor(
    @InjectRepository(Actividade)
    private readonly actividadesRepository: Repository<Actividade>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>
  ) {}
  async create(createActividadeDto: CreateActividadeDto, user: User) {
    const {
      titulo,
      descripcion,
      usuarioAsignado,
      eventoId,
      fechaFin,
      fechaInicio,
      actividadDependenciaId,
    } = createActividadeDto;
    try {
      if (!titulo || !descripcion || !usuarioAsignado) {
        throw new BadRequestException(
          'No se proporcionaron todos los argumentos'
        );
      }
      const usuarioEncontrado = await this.userRepository.findOne({
        where: { id: usuarioAsignado },
      });
      if (!usuarioEncontrado) {
        throw new NotFoundException('No se encontro el usuario asignado');
      }

      const eventoEncontrado = await this.eventoRepository.findOne({
        where: { id: eventoId },
      });
      if (!eventoEncontrado) {
        throw new NotFoundException('No se encontro el evento asignado');
      }

      const startDate = new Date(createActividadeDto.fechaInicio);
      const endDate = new Date(createActividadeDto.fechaFin);
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

      let actividadDependenciaEncontrada = null;

      if (actividadDependenciaId) {
        actividadDependenciaEncontrada =
          await this.actividadesRepository.findOne({
            where: { id: actividadDependenciaId },
          });

        if (!actividadDependenciaEncontrada) {
          throw new NotFoundException('Tarea dependiente no encontrada');
        }
      }

      const actividad = this.actividadesRepository.create({
        titulo: titulo,
        descripcion: descripcion,
        evento: eventoEncontrado,
        usuarioAsignado: usuarioEncontrado,
        creador: user,
        actividadDependencia: actividadDependenciaEncontrada,
        fechaFin,
        fechaInicio,
      });
      await this.actividadesRepository.save(actividad);
      return 'Actividad Creada Exitosamente';
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all actividades`;
  }

  async findAllByEventoId(id: string) {
    try {
      const evento = await this.eventoRepository.findOne({
        where: { id: id },
        relations: ['actividad'],
      });
      if (!evento) {
        throw new NotFoundException('Evento no encontrado');
      }
      const actividadesByEvento = evento.actividad;
      if (!actividadesByEvento || actividadesByEvento.length === 0) {
        throw new NotFoundException(
          'No se encontraron actividades en este evento'
        );
      }
      return actividadesByEvento;
    } catch (error) {
      throw error;
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} actividade`;
  }

  async update(
    id: string,
    updateActividadDto: UpdateActividadeDto,
    user: User
  ) {
    try {
      const actividad = await this.actividadesRepository.findOne({
        where: { id },
        relations: ['actividadDependencia'],
      });

      if (!actividad) {
        throw new NotFoundException('Actividad no encontrada');
      }

      const startDate = new Date(updateActividadDto.fechaInicio);
      const endDate = new Date(updateActividadDto.fechaFin);
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
        actividad.actividadDependencia &&
        actividad.actividadDependencia.estado !== 'Finalizada' &&
        updateActividadDto.estado !== undefined
      ) {
        const nombreDependencia =
          actividad.actividadDependencia.titulo || 'actividad dependiente';
        throw new BadRequestException(
          `No se puede cambiar el estado porque la actividad de la que depende (${nombreDependencia}) no está finalizada`
        );
      }

      Object.assign(actividad, updateActividadDto);
      actividad.actualizadoPor = user;

      return await this.actividadesRepository.save(actividad);
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    try {
      const actividadEncontrada = await this.actividadesRepository.findOne({
        where: { id: id },
      });
      if (!actividadEncontrada) {
        throw new NotFoundException(
          'No se encontro la actividad que deseas eliminar'
        );
      }
      await this.actividadesRepository.remove(actividadEncontrada);
      return 'Actividad eliminada exitosamente';
    } catch (error) {
      throw error;
    }
  }
}
