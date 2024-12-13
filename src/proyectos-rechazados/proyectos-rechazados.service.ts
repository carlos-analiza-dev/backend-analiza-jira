import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProyectosRechazadoDto } from './dto/create-proyectos-rechazado.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ProyectosRechazado } from './entities/proyectos-rechazado.entity';
import { Repository } from 'typeorm';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class ProyectosRechazadosService {
  constructor(
    @InjectRepository(ProyectosRechazado)
    private readonly proyectoRechazadoRepo: Repository<ProyectosRechazado>,
    @InjectRepository(Proyecto)
    private readonly proyectosRepositori: Repository<Proyecto>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}
  async create(createProyectosRechazadoDto: CreateProyectosRechazadoDto) {
    const { proyectoId, usuarioId, motivo } = createProyectosRechazadoDto;

    try {
      const proyecto = await this.proyectosRepositori.findOne({
        where: { id: proyectoId },
      });
      if (!proyecto) {
        throw new NotFoundException(
          `El proyecto con ID ${proyectoId} no existe.`
        );
      }

      const usuario = await this.userRepository.findOne({
        where: { id: usuarioId },
      });
      if (!usuario) {
        throw new NotFoundException(
          `El usuario con ID ${usuarioId} no existe.`
        );
      }

      const proyectoRechazado = this.proyectoRechazadoRepo.create({
        proyecto,
        usuario,
        motivoRechazo: motivo,
        fechaRechazo: new Date(),
      });

      return await this.proyectoRechazadoRepo.save(proyectoRechazado);
    } catch (error) {
      throw error;
    }
  }

  findAll() {
    return `This action returns all proyectosRechazados`;
  }

  async getProyectosRechazados(paginationDto: PaginationDto, userId: string) {
    const { limit = 5, offset = 0 } = paginationDto;

    try {
      const [proyectosRechazados, total] =
        await this.proyectoRechazadoRepo.findAndCount({
          where: { usuario: { id: userId } },
          relations: ['proyecto', 'usuario'],
          take: limit,
          skip: offset,
        });

      if (proyectosRechazados.length === 0) {
        throw new NotFoundException(
          `No se encontraron proyectos rechazados para el usuario con ID ${userId}.`
        );
      }

      return {
        proyectosRechazados,
        total,
      };
    } catch (error) {
      throw error;
    }
  }
}
