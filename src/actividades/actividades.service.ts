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
    const { titulo, descripcion, usuarioAsignado, eventoId } =
      createActividadeDto;
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
      const actividad = this.actividadesRepository.create({
        titulo: titulo,
        descripcion: descripcion,
        evento: eventoEncontrado,
        usuarioAsignado: usuarioEncontrado,
        creador: user,
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
      console.log(error);

      throw error;
    }
  }

  findOne(id: string) {
    return `This action returns a #${id} actividade`;
  }

  async update(
    id: string,
    updateActividadeDto: UpdateActividadeDto,
    user: User
  ) {
    try {
      const actividad = await this.actividadesRepository.findOne({
        where: { id },
      });
      if (!actividad) {
        throw new BadRequestException('No se pudo actualizar la actividad');
      }
      Object.assign(actividad, updateActividadeDto);
      actividad.actualizadoPor = user;
      return this.actividadesRepository.save(actividad);
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
