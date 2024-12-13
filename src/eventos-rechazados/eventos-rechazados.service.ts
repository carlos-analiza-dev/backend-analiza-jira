import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEventosRechazadoDto } from './dto/create-eventos-rechazado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EventosRechazado } from './entities/eventos-rechazado.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { Evento } from 'src/evento/entities/evento.entity';

@Injectable()
export class EventosRechazadosService {
  constructor(
    @InjectRepository(EventosRechazado)
    private readonly eventoRechazadoRepo: Repository<EventosRechazado>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>
  ) {}

  async create(createEventosRechazadoDto: CreateEventosRechazadoDto) {
    const { eventoId, usuarioId, motivo } = createEventosRechazadoDto;

    try {
      const evento = await this.eventoRepository.findOne({
        where: { id: eventoId },
      });
      if (!evento) {
        throw new NotFoundException(`El evento con ID ${eventoId} no existe.`);
      }

      const usuario = await this.userRepository.findOne({
        where: { id: usuarioId },
      });
      if (!usuario) {
        throw new NotFoundException(
          `El usuario con ID ${usuarioId} no existe.`
        );
      }

      const eventoRechazado = this.eventoRechazadoRepo.create({
        evento,
        usuario,
        motivoRechazo: motivo,
        fechaRechazo: new Date(),
      });

      return await this.eventoRechazadoRepo.save(eventoRechazado);
    } catch (error) {
      throw error;
    }
  }

  async getEventosRechazados(paginationDto: PaginationDto, userId: string) {
    const { limit = 5, offset = 0 } = paginationDto;

    try {
      const [eventosRechazados, total] =
        await this.eventoRechazadoRepo.findAndCount({
          where: { usuario: { id: userId } },
          relations: ['evento', 'usuario'],
          take: limit,
          skip: offset,
        });

      if (eventosRechazados.length === 0) {
        throw new NotFoundException(
          `No se encontraron eventos rechazados para el usuario con ID ${userId}.`
        );
      }

      return {
        eventosRechazados,
        total,
      };
    } catch (error) {
      throw error;
    }
  }
}
