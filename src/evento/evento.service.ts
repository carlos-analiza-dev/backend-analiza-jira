import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { In, LessThan, Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { User } from 'src/auth/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Actividade } from 'src/actividades/entities/actividade.entity';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Actividade)
    private readonly actuvidadeRepository: Repository<Actividade>
  ) {}
  async create(createEventoDto: CreateEventoDto, user: User) {
    const {
      nombre,
      descripcion,
      fechaInicio,
      fechaFin,
      tipoEvento,
      responsableId,
    } = createEventoDto;

    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    const currentDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior o igual a la fecha de fin.'
      );
    }

    if (startDate < currentDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser menor que la fecha actual.'
      );
    }

    const responsableEvento = await this.userRepository.findOne({
      where: { id: responsableId },
    });

    if (!responsableEvento) {
      throw new NotFoundException(
        'No se encontro el usuario que deseas asignar como responsable del evento'
      );
    }

    try {
      const eventoCreado = this.eventoRepository.create({
        nombre: nombre,
        descripcion: descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        tipoEvento: tipoEvento,
        responsable: responsableEvento,
        usuarioCreador: user,
      });
      await this.eventoRepository.save(eventoCreado);
      return 'Evento creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async addColaborador(eventoId: string, userId: string, user: User) {
    try {
      const evento = await this.eventoRepository.findOne({
        where: { id: eventoId },
        relations: ['usuarios', 'usuarioCreador', 'responsable'],
      });

      if (!evento) {
        throw new NotFoundException('No se encontró el evento');
      }

      const colaborador = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!colaborador) {
        throw new NotFoundException('No se encontró el colaborador');
      }

      if (evento.usuarioCreador && evento.usuarioCreador.id === userId) {
        throw new BadRequestException(
          'El creador del evento no puede ser un colaborador'
        );
      }

      if (evento.responsable && evento.responsable.id === userId) {
        throw new BadRequestException(
          'El responsable del evento no puede ser un colaborador'
        );
      }

      if (evento.usuarios.some((u) => u.id === colaborador.id)) {
        throw new BadRequestException(
          'El colaborador ya forma parte del evento'
        );
      }

      evento.usuarios.push(colaborador);
      await this.eventoRepository.save(evento);

      return { message: 'Colaborador agregado exitosamente' };
    } catch (error) {
      throw error;
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async actualizarEstadoEventos() {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    console.log('Fecha actual (normalizada):', currentDate);

    try {
      const result = await this.eventoRepository
        .createQueryBuilder()
        .update(Evento)
        .set({ estado: 'Finalizado' })
        .where('fechaFin < :currentDate', { currentDate })
        .andWhere('estado != :estado', { estado: 'Finalizado' })
        .execute();

      if (result.affected > 0) {
        console.log(
          `${result.affected} eventos han sido actualizados a "Finalizado".`
        );
      } else {
        console.log('No hay eventos para actualizar.');
      }
    } catch (error) {
      console.error('Error actualizando el estado de eventos:', error);
    }
  }

  async findAllByAdmin(user: User) {
    try {
      const eventos = await this.eventoRepository
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.usuarioCreador', 'usuarioCreador')
        .leftJoinAndSelect('evento.usuarios', 'usuarios')
        .leftJoinAndSelect('evento.responsable', 'responsable')
        .where('usuarioCreador.id = :userId', { userId: user.id })
        .orWhere('usuarios.id = :userId', { userId: user.id })
        .orWhere('responsable.id = :userId', { userId: user.id })
        .getMany();

      if (!eventos.length) {
        throw new NotFoundException('No estás en ningún evento');
      }

      return eventos;
    } catch (error) {
      throw error;
    }
    /* const { limit = 5, offset = 0, tipoEvento, estado } = paginationDto;

    try {
      const query = this.eventoRepository
        .createQueryBuilder('evento')
        .where('evento.usuarioCreador = :userId', { userId: user.id });

      if (estado) {
        query.andWhere('evento.estado = :estado', { estado });
      }

      if (tipoEvento) {
        query.andWhere('evento.tipoEvento = :tipoEvento', { tipoEvento });
      }

      const [eventosByUser, total] = await query
        .andWhere('evento.estado IN (:...estados)', {
          estados: ['Activo', 'Pospuesto'],
        })
        .take(limit)
        .skip(offset)
        .getManyAndCount();

      if (!eventosByUser || eventosByUser.length === 0) {
        throw new NotFoundException('No se encontraron eventos.');
      }

      return {
        data: eventosByUser,
        total,
      };
    } catch (error) {
      throw error;
    } */
  }

  async getColaboradoresByEventoId(eventoId: string, user: User) {
    try {
      const evento = await this.eventoRepository.findOne({
        where: { id: eventoId },
        relations: ['usuarios'],
      });

      if (!evento) {
        throw new NotFoundException('No se encontró el evento');
      }

      const colaboradores = evento.usuarios.filter(
        (colaborador) => colaborador.id !== evento.usuarioCreador.id
      );

      if (!colaboradores || colaboradores.length === 0) {
        throw new NotFoundException(
          'No se encontraron colaboradores para este evento'
        );
      }

      return colaboradores;
    } catch (error) {
      throw error;
    }
  }

  async getUsersByEventoId(eventoId: string, user: User) {
    try {
      const evento = await this.eventoRepository.findOne({
        where: { id: eventoId },
        relations: ['usuarios', 'responsable', 'usuarioCreador'],
      });

      if (!evento) {
        throw new NotFoundException(`Evento con id ${eventoId} no encontrado`);
      }

      const colaboradoresActivos = evento.usuarios.filter(
        (colaborador) =>
          colaborador.isActive === 1 && colaborador.autorizado === 1
      );

      let responsableActivo = null;
      if (
        evento.responsable &&
        evento.responsable.isActive === 1 &&
        evento.responsable.autorizado === 1
      ) {
        responsableActivo = evento.responsable;
      }

      let creadorActivo = null;
      if (
        evento.usuarioCreador &&
        evento.usuarioCreador.isActive === 1 &&
        evento.usuarioCreador.autorizado === 1
      ) {
        creadorActivo = evento.usuarioCreador;
      }

      const usuariosFiltrados = [
        ...colaboradoresActivos,
        responsableActivo,
        creadorActivo,
      ].filter((usuario) => usuario !== null);

      if (usuariosFiltrados.length === 0) {
        throw new NotFoundException('No se encontraron usuarios disponibles');
      }

      return usuariosFiltrados;
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: string) {
    try {
      const evento = await this.eventoRepository.findOne({ where: { id } });
      if (!evento)
        throw new NotFoundException('No se encontro el evento especificado');
      return evento;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateEventoDto: UpdateEventoDto) {
    await this.findOne(id);
    const { fechaFin, fechaInicio } = updateEventoDto;

    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
    const currentDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    currentDate.setHours(0, 0, 0, 0);

    if (startDate >= endDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser posterior o igual a la fecha de fin.'
      );
    }

    if (startDate < currentDate) {
      throw new BadRequestException(
        'La fecha de inicio no puede ser menor que la fecha actual.'
      );
    }

    try {
      await this.eventoRepository.update(id, updateEventoDto);

      const updatedEvento = await this.eventoRepository.findOne({
        where: { id },
      });
      if (!updatedEvento) {
        throw new NotFoundException(
          'No se pudo actualizar el evento, evento no encontrado.'
        );
      }

      return {
        message: 'Evento actualizado correctamente',
        updatedEvento,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteColaborador(eventoId: string, userId: string, user: User) {
    const evento = await this.eventoRepository.findOne({
      where: { id: eventoId },
      relations: ['usuarios'],
    });
    if (!evento) throw new NotFoundException('No se encontro el evento');

    const colaborador = evento.usuarios.find((u) => u.id === userId);
    if (!colaborador)
      throw new NotFoundException('No se encontro el colaborador a eliminar');

    evento.usuarios = evento.usuarios.filter((u) => u.id !== userId);

    await this.eventoRepository.save(evento);

    return { message: 'Colaborador eliminado exitosamente' };
  }

  async remove(id: string) {
    try {
      const eventoEliminar = await this.eventoRepository.findOne({
        where: { id },
        relations: ['actividad'],
      });
      if (!eventoEliminar) {
        throw new NotFoundException('No se encontro el evento a eliminar');
      }
      if (eventoEliminar.actividad && eventoEliminar.actividad.length > 0) {
        await this.eventoRepository.manager.remove(eventoEliminar.actividad);
      }
      await this.eventoRepository.remove(eventoEliminar);
      return 'Evento eliminado exitosamente';
    } catch (error) {
      throw error;
    }
  }
}
