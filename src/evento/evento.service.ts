import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Not, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Evento } from './entities/evento.entity';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class EventoService {
  constructor(
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  async create(createEventoDto: CreateEventoDto, user: User) {
    const { nombre, descripcion, fechaInicio, fechaFin, tipoEvento } =
      createEventoDto;

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
      const usuarioCreado = this.eventoRepository.create({
        nombre: nombre,
        descripcion: descripcion,
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
        tipoEvento: tipoEvento,
        usuarioCreador: user,
      });
      await this.eventoRepository.save(usuarioCreado);
      return 'Evento creado exitosamente';
    } catch (error) {
      throw error;
    }
  }

  async findAllByAdmin(user: User) {
    try {
      const eventosByUser = await this.eventoRepository.find({
        where: { usuarioCreador: user },
      });
      if (!eventosByUser || eventosByUser.length === 0) {
        throw new NotFoundException('No se encontraron  eventos.');
      }
      return eventosByUser;
    } catch (error) {
      throw error;
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} evento`;
  }

  update(id: number, updateEventoDto: UpdateEventoDto) {
    return `This action updates a #${id} evento`;
  }

  async remove(id: string) {
    const eventoExiste = await this.eventoRepository.findOne({
      where: { id: id },
    });
    if (!eventoExiste)
      throw new NotFoundException(
        'No se encontro el evento que se desea eliminar'
      );
    await this.eventoRepository.remove(eventoExiste);
    return 'El evento ha sido eliminado exitosamente';
  }
}
