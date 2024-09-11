import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Proyecto } from './entities/proyecto.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { ColaboradorDTO } from './dto/colaborador.dto';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly pryectoRespository: Repository<Proyecto>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
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

  async addColaborador(proyectoId: string, userId: string, user: User) {
    try {
      const proyecto = await this.pryectoRespository.findOne({
        where: { id: proyectoId },
        relations: ['usuarios'],
      });

      if (!proyecto) {
        throw new NotFoundException('No se encontró el proyecto');
      }

      const colaborador = await this.userRepository.findOne({
        where: { id: userId },
      });

      if (!colaborador) {
        throw new NotFoundException('No se encontró el colaborador');
      }

      if (proyecto.creador.id === userId) {
        throw new BadRequestException(
          'El creador del proyecto no puede ser un colaborador'
        );
      }

      if (proyecto.usuarios.some((u) => u.id === colaborador.id)) {
        throw new BadRequestException(
          'El colaborador ya forma parte del proyecto'
        );
      }

      proyecto.usuarios.push(colaborador);
      await this.pryectoRespository.save(proyecto);

      return { message: 'Colaborador agregado exitosamente' };
    } catch (error) {
      throw error;
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

  async getColaboradoresByProjectId(proyectoId: string, user: User) {
    try {
      const proyecto = await this.pryectoRespository.findOne({
        where: { id: proyectoId },
        relations: ['usuarios'],
      });

      if (!proyecto) {
        throw new NotFoundException('No se encontró el proyecto');
      }

      const colaboradores = proyecto.usuarios.filter(
        (colaborador) => colaborador.id !== proyecto.creador.id
      );

      return colaboradores;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    const proyecto = await this.pryectoRespository.findOne({ where: { id } });
    try {
      if (!proyecto)
        throw new NotFoundException(
          `No se encontraron proyectos con el id: ${id}`
        );
      return proyecto;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllProyectos(user: User) {
    try {
      const proyectosCreados = await this.pryectoRespository.find({
        where: { creador: user },
      });

      const proyectosColaborador = await this.pryectoRespository
        .createQueryBuilder('proyecto')
        .innerJoinAndSelect('proyecto.usuarios', 'usuarios')
        .where('usuarios.id = :userId', { userId: user.id })
        .getMany();

      const todosProyectos = [...proyectosCreados, ...proyectosColaborador];

      if (!todosProyectos.length) {
        throw new NotFoundException('No estás en ningún proyecto');
      }

      return todosProyectos;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, updateProyectoDto: UpdateProyectoDto) {
    try {
      const proyectoId = await this.pryectoRespository.findOne({
        where: { id },
      });
      if (!proyectoId)
        throw new NotFoundException(
          'No se encontro el proyecto que deseas actualizar'
        );
      await this.pryectoRespository.update(id, updateProyectoDto);
      return 'Proyecto actualizado exitosamente';
    } catch (error) {
      console.log(error);
      this.handleError(error);
    }
  }

  async deleteColaborador(proyectoId: string, userId: string, user: User) {
    console.log(proyectoId);

    const proyecto = await this.pryectoRespository.findOne({
      where: { id: proyectoId },
      relations: ['usuarios'],
    });
    if (!proyecto) throw new NotFoundException('No se encontro el proyecto');

    const colaborador = proyecto.usuarios.find((u) => u.id === userId);
    if (!colaborador)
      throw new NotFoundException('No se encontro el colaborador a eliminar');

    proyecto.usuarios = proyecto.usuarios.filter((u) => u.id !== userId);

    await this.pryectoRespository.save(proyecto);

    return { message: 'Colaborador eliminado exitosamente' };
  }

  async remove(id: string) {
    const proyectoDelete = await this.pryectoRespository.findOne({
      where: { id },
      relations: ['tareas'],
    });
    try {
      if (!proyectoDelete)
        throw new NotFoundException('No se encontro el proyecto a eliminar');
      if (proyectoDelete.tareas && proyectoDelete.tareas.length > 0) {
        await this.pryectoRespository.manager.remove(proyectoDelete.tareas);
      }
      await this.pryectoRespository.remove(proyectoDelete);
      return 'Proyecto eliminado exitosamente';
    } catch (error) {
      console.log(error);
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException(
      'Hubo un error interno en el servidor, por favor revisalo'
    );
  }
}
