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
import { Brackets, Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class ProyectosService {
  constructor(
    @InjectRepository(Proyecto)
    private readonly pryectoRespository: Repository<Proyecto>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolRepository: Repository<Role>,
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>,
    private readonly mailService: MailService
  ) {}
  async create(createProyectoDto: CreateProyectoDto, user: User) {
    const {
      nombre,
      cliente,
      descripcion,
      estado,
      responsableId,
      rolDirigido,
      empresaId,
      justificacion,
    } = createProyectoDto;
    try {
      const responsable = await this.userRepository.findOne({
        where: { id: responsableId },
      });
      if (!responsable) {
        throw new NotFoundException(
          `No se encontro el responsable con id: ${responsableId}`
        );
      }

      const rol = await this.rolRepository.findOne({
        where: { id: rolDirigido },
      });
      if (!rol) {
        throw new NotFoundException(
          `No se encontró el rol con id: ${rolDirigido}`
        );
      }

      const empresa = await this.empresaRepository.findOne({
        where: { id: empresaId },
      });
      if (!empresa) {
        throw new NotFoundException(
          `No se encontró el rol con id: ${rolDirigido}`
        );
      }

      const proyecto = this.pryectoRespository.create({
        nombre: nombre,
        cliente: cliente,
        descripcion: descripcion,
        estado: estado,
        creador: user,
        responsable: responsable,
        rolDirigido: rol,
        empresa: empresa,
        justificacion: justificacion,
      });
      if (!proyecto) {
        throw new BadRequestException('Ocurrio un error al crear el proyecto');
      }
      await this.mailService.sendEmailConfirmProject(
        responsable.correo,
        responsable.nombre,
        nombre
      );
      await this.pryectoRespository.save(proyecto);
      return proyecto;
    } catch (error) {
      throw error;
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

      if (proyecto.responsable.id === userId) {
        throw new BadRequestException(
          'El responsable del proyecto no puede ser un colaborador'
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
        where: { creador: user },
      });
      if (!proyectos || proyectos.length === 0)
        throw new NotFoundException('No se encontraron proyectos');
      return proyectos;
    } catch (error) {
      throw error;
    }
  }

  async getProyectosPorStatus(responsableId: string) {
    // Buscar los proyectos del responsable
    const proyectos = await this.pryectoRespository.find({
      where: { responsable: { id: responsableId } },
    });

    if (!proyectos.length) {
      throw new NotFoundException(
        'No se encontraron proyectos para este usuario'
      );
    }

    // Contar por status
    const statusCounts = {
      Pendiente: 0,
      Rechazado: 0,
      Aceptado: 0,
    };

    proyectos.forEach((proyecto) => {
      if (statusCounts[proyecto.statusProject] !== undefined) {
        statusCounts[proyecto.statusProject]++;
      }
    });

    return {
      totalProyectos: proyectos.length,
      ...statusCounts,
    };
  }

  async findProyectosManager(paginationDto: PaginationDto = {}) {
    const { estado, limit = 5, offset = 0 } = paginationDto;

    try {
      const query = this.pryectoRespository
        .createQueryBuilder('proyecto')
        .leftJoinAndSelect('proyecto.creador', 'creador')
        .leftJoinAndSelect('proyecto.usuarios', 'usuarios')
        .leftJoinAndSelect('proyecto.responsable', 'responsable')
        .leftJoinAndSelect('proyecto.rolDirigido', 'rolDirigido')
        .leftJoinAndSelect('proyecto.empresa', 'empresa')
        .orderBy('proyecto.fechaCreacion', 'DESC') // Ordenar por fecha de creación en orden descendente
        .skip(offset)
        .take(limit);

      // Aplica el filtro de estado si está definido y no es nulo
      if (estado !== undefined && estado !== null && estado !== '') {
        query.andWhere('proyecto.estado = :estado', { estado });
      }

      const [proyectos, total] = await query.getManyAndCount();

      // Devuelve un objeto vacío si no se encontraron proyectos
      if (!proyectos.length) {
        return {
          total: 0,
          proyectos: [],
        };
      }

      return {
        total,
        proyectos,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllStatusProyectos() {
    const proyectosProgress = await this.pryectoRespository.find({
      where: { estado: 'En Progreso' },
    });
    const proyectosFinally = await this.pryectoRespository.find({
      where: { estado: 'Finalizado' },
    });

    return {
      progreso: proyectosProgress.length,
      finalizado: proyectosFinally.length,
    };
  }

  async getColaboradoresByProjectId(proyectoId: string, user: User) {
    try {
      const proyecto = await this.pryectoRespository.findOne({
        where: { id: proyectoId },
        relations: ['usuarios', 'responsable', 'creador'], // Asegúrate de que 'creador' esté en las relaciones
      });

      if (!proyecto) {
        throw new NotFoundException('No se encontró el proyecto');
      }

      // Filtrar colaboradores, excluyendo al creador del proyecto
      const colaboradores = proyecto.usuarios.filter(
        (colaborador) => colaborador.id !== proyecto.creador.id
      );

      // Añadir responsable si está activo
      let responsableActivo = null;
      if (
        proyecto.responsable &&
        proyecto.responsable.isActive === 1 &&
        proyecto.responsable.autorizado === 1
      ) {
        responsableActivo = proyecto.responsable;
      }

      // Añadir creador si está activo
      let creadorActivo = null;
      if (
        proyecto.creador &&
        proyecto.creador.isActive === 1 &&
        proyecto.creador.autorizado === 1
      ) {
        creadorActivo = proyecto.creador;
      }

      // Combinar colaboradores, responsable y creador
      const usuariosProyecto = [
        ...colaboradores,
        responsableActivo,
        creadorActivo,
      ].filter((usuario) => usuario !== null);

      return usuariosProyecto;
    } catch (error) {
      throw error;
    }
  }

  async getColaboradoresProjectId(proyectoId: string, user: User) {
    try {
      const proyecto = await this.pryectoRespository.findOne({
        where: { id: proyectoId },
        relations: ['usuarios', 'responsable'],
      });

      if (!proyecto) {
        throw new NotFoundException('No se encontró el proyecto');
      }

      const colaboradores = proyecto.usuarios.filter(
        (colaborador) => colaborador.id !== proyecto.creador.id
      );

      return colaboradores;
    } catch (error) {
      throw error;
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
      const proyectos = await this.pryectoRespository
        .createQueryBuilder('proyecto')
        .leftJoinAndSelect('proyecto.creador', 'creador')
        .leftJoinAndSelect('proyecto.usuarios', 'usuarios')
        .leftJoinAndSelect('proyecto.responsable', 'responsable')
        .leftJoinAndSelect('proyecto.empresa', 'empresa')

        .where(
          new Brackets((qb) => {
            qb.where('creador.id = :userId', { userId: user.id })
              .orWhere('usuarios.id = :userId', { userId: user.id })
              .orWhere('responsable.id = :userId', { userId: user.id });
          })
        )
        .andWhere('proyecto.estado != :estado', { estado: 'Finalizado' })
        .andWhere('proyecto.statusProject = :statusProject', {
          statusProject: 'Aceptado',
        })
        .getMany();

      if (!proyectos.length) {
        throw new NotFoundException('No estás en ningún proyecto en progreso');
      }

      return proyectos;
    } catch (error) {
      throw error;
    }
  }

  async findAllProyectosResponsable(user: User) {
    console.log('USERRR', user);

    try {
      const proyectos = await this.pryectoRespository
        .createQueryBuilder('proyecto')
        .leftJoinAndSelect('proyecto.creador', 'creador')
        .leftJoinAndSelect('proyecto.usuarios', 'usuarios')
        .leftJoinAndSelect('proyecto.responsable', 'responsable')
        .leftJoinAndSelect('proyecto.empresa', 'empresa')
        .where('proyecto.responsable.id = :userId', { userId: user.id })
        .andWhere('proyecto.statusProject = :statusProject', {
          statusProject: 'Pendiente',
        })
        .andWhere('proyecto.estado = :estado', { estado: 'En Progreso' })
        .getMany();

      if (!proyectos.length) {
        throw new NotFoundException(
          'No tienes proyectos pendientes como responsable'
        );
      }

      return proyectos;
    } catch (error) {
      throw error;
    }
  }

  async findRejectedProyectos(user: User) {
    try {
      const proyectos = await this.pryectoRespository
        .createQueryBuilder('proyecto')
        .leftJoinAndSelect('proyecto.creador', 'creador')
        .leftJoinAndSelect('proyecto.responsable', 'responsable')
        .leftJoinAndSelect('proyecto.empresa', 'empresa')
        .where('creador.id = :userId', { userId: user.id })
        .andWhere('proyecto.statusProject = :statusProject', {
          statusProject: 'Rechazado',
        })
        .getMany();

      if (!proyectos.length) {
        throw new NotFoundException('No has creado proyectos rechazados.');
      }

      return proyectos;
    } catch (error) {
      throw error;
    }
  }

  async findAceptProyectos() {
    const aceptados = await this.pryectoRespository.find({
      where: { statusProject: 'Aceptado' },
    });
    const pendientes = await this.pryectoRespository.find({
      where: { statusProject: 'Pendiente' },
    });
    const rechazado = await this.pryectoRespository.find({
      where: { statusProject: 'Rechazado' },
    });
    try {
      if (!aceptados || aceptados.length === 0) {
        throw new NotFoundException('No se encontraron proyectos aceptados');
      }
      if (!pendientes || pendientes.length === 0) {
        throw new NotFoundException('No se encontraron proyectos pendientes');
      }
      if (!rechazado || rechazado.length === 0) {
        throw new NotFoundException('No se encontraron proyectos rechazados');
      }
      return {
        aceptados: aceptados.length,
        rechazados: rechazado.length,
        pendientes: pendientes.length,
      };
    } catch (error) {}
  }

  async update(id: string, updateProyectoDto: UpdateProyectoDto) {
    try {
      const proyecto = await this.pryectoRespository.findOne({
        where: { id },
        relations: ['creador', 'responsable'],
      });

      if (!proyecto) {
        throw new NotFoundException(
          'No se encontró el proyecto que deseas actualizar'
        );
      }

      // Itera sobre las propiedades del DTO y actualiza solo los campos presentes
      Object.keys(updateProyectoDto).forEach((key) => {
        const value = updateProyectoDto[key];
        if (value !== undefined && value !== null) {
          proyecto[key] = value;
        }
      });

      // Si existe un nuevo responsableId, busca al responsable y actualiza la relación
      if (updateProyectoDto.responsableId) {
        const responsable = await this.userRepository.findOne({
          where: { id: updateProyectoDto.responsableId },
        });

        if (!responsable) {
          throw new NotFoundException('Responsable no encontrado');
        }

        proyecto.responsable = responsable;
      }

      // Si el estado del proyecto ha cambiado, se envía el correo correspondiente
      if (updateProyectoDto.statusProject) {
        const nuevoEstado = updateProyectoDto.statusProject;
        const correo = proyecto.creador.correo;
        const nombre = proyecto.creador.nombre;
        const responsable = proyecto.responsable;
        const proyectoNombre = proyecto.nombre;

        if (nuevoEstado === 'Aceptado') {
          this.mailService.sendEmailAceptProyecto(
            correo,
            nombre,
            responsable.nombre,
            proyectoNombre
          );
        } else if (nuevoEstado === 'Rechazado') {
          this.mailService.sendEmailRejectProyecto(
            correo,
            nombre,
            responsable.nombre,
            proyectoNombre
          );
        } else if (nuevoEstado === 'Pendiente') {
          this.mailService.sendEmailConfirmProject(
            responsable.correo,
            responsable.nombre,
            proyectoNombre
          );
        }
      }

      // Guarda el proyecto actualizado
      await this.pryectoRespository.save(proyecto);
      return 'Proyecto actualizado exitosamente';
    } catch (error) {
      console.log('ERROR BACK', error);
      this.handleError(error);
    }
  }

  async deleteColaborador(proyectoId: string, userId: string, user: User) {
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
      this.handleError(error);
    }
  }

  private handleError(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException(
      'Hubo un error interno en el servidor, por favor revisalo'
    );
  }
}
