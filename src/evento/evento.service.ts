import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { User } from 'src/auth/entities/user.entity';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly mailServise: MailService
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
      await this.mailServise.sendEmailConfirmEvento(
        responsableEvento.correo,
        responsableEvento.nombre,
        nombre
      );
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
        .where(
          '(usuarioCreador.id = :userId OR usuarios.id = :userId OR responsable.id = :userId)',
          { userId: user.id }
        )
        .andWhere('evento.estado IN (:...estados)', {
          estados: ['Activo', 'Pospuesto'],
        })
        .andWhere('evento.statusEvento = :statusEvento', {
          statusEvento: 'Aceptado',
        })
        .getMany();

      if (!eventos.length) {
        throw new NotFoundException(
          'No estás en ningún evento con estado Activo o Pospuesto'
        );
      }

      return eventos;
    } catch (error) {
      throw error;
    }
  }

  async findAllEventosResponsable(user: User) {
    try {
      const eventos = await this.eventoRepository
        .createQueryBuilder('evento')
        .leftJoinAndSelect('evento.usuarioCreador', 'usuarioCreador')
        .leftJoinAndSelect('evento.usuarios', 'usuarios')
        .leftJoinAndSelect('evento.responsable', 'responsable')
        .where('evento.responsable.id = :userId', { userId: user.id })
        .andWhere('evento.estado IN (:...estados)', {
          estados: ['Activo', 'Pospuesto'],
        })
        .andWhere('evento.statusEvento = :statusEvento', {
          statusEvento: 'Pendiente',
        })
        .getMany();

      if (!eventos.length) {
        throw new NotFoundException(
          'No tienes eventos activos o pospuestos como responsable'
        );
      }

      return eventos;
    } catch (error) {
      throw error;
    }
  }

  async findAllEventosManager(paginationDto: PaginationDto) {
    const { limit, offset, tipoEvento } = paginationDto;

    try {
      const query = this.eventoRepository.createQueryBuilder('evento');

      // Filtrado por tipo de evento, si se proporciona
      if (tipoEvento) {
        query.andWhere('evento.tipoEvento = :tipoEvento', { tipoEvento });
      }

      // Paginación
      query.skip(offset).take(limit);

      // Obtener resultados
      const [eventos, total] = await query.getManyAndCount();

      return {
        data: eventos,
        total,
      };
    } catch (error) {
      throw new Error('Error al obtener eventos');
    }
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

  async findAllStatusEventos() {
    const aceptados = await this.eventoRepository.find({
      where: { statusEvento: 'Aceptado' },
    });
    const pendientes = await this.eventoRepository.find({
      where: { statusEvento: 'Pendiente' },
    });
    const rechazado = await this.eventoRepository.find({
      where: { statusEvento: 'Rechazado' },
    });
    try {
      if (!aceptados || aceptados.length === 0) {
        throw new NotFoundException('No se encontraron eventos aceptados');
      }
      if (!pendientes || pendientes.length === 0) {
        throw new NotFoundException('No se encontraron eventos pendientes');
      }
      if (!rechazado || rechazado.length === 0) {
        throw new NotFoundException('No se encontraron eventos rechazados');
      }
      return {
        aceptados: aceptados.length,
        rechazados: rechazado.length,
        pendientes: pendientes.length,
      };
    } catch (error) {}
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
    const eventoId = await this.findOne(id);

    if (!eventoId)
      throw new NotFoundException(
        'No se encontro el evento que deseas actualizar'
      );
    const { fechaFin, fechaInicio } = updateEventoDto;

    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);
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

    try {
      await this.eventoRepository.update(id, updateEventoDto);
      if (updateEventoDto.statusEvento) {
        const nuevoEstado = updateEventoDto.statusEvento;
        if (nuevoEstado === 'Aceptado') {
          const correo = eventoId.usuarioCreador.correo;
          const nombre = eventoId.usuarioCreador.nombre;
          const responsable = eventoId.responsable.nombre;
          const evento = eventoId.nombre;
          this.mailServise.sendEmailAceptEvento(
            correo,
            nombre,
            responsable,
            evento
          );
        } else if (nuevoEstado === 'Rechazado') {
          const correo = eventoId.usuarioCreador.correo;
          const nombre = eventoId.usuarioCreador.nombre;
          const responsable = eventoId.responsable.nombre;
          const evento = eventoId.nombre;
          this.mailServise.sendEmailRejectEvento(
            correo,
            nombre,
            responsable,
            evento
          );
        }
      }
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
