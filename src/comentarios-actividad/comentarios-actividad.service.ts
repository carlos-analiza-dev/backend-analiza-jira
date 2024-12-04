import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateComentarioDto } from './dto/create-comentarios-actividad.dto';
import { UpdateComentariosActividadDto } from './dto/update-comentarios-actividad.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ComentariosActividad } from './entities/comentarios-actividad.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Actividade } from 'src/actividades/entities/actividade.entity';

@Injectable()
export class ComentariosActividadService {
  constructor(
    @InjectRepository(ComentariosActividad)
    private readonly comentarioRepository: Repository<ComentariosActividad>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Actividade)
    private readonly actividadRepository: Repository<Actividade>
  ) {}

  async create(
    actividadId: string,
    createComentariosActividadDto: CreateComentarioDto
  ) {
    const { contenido, userId } = createComentariosActividadDto;

    try {
      if (!contenido)
        throw new NotFoundException(
          `No se encontró la actividad con ID ${actividadId}`
        );

      const actividad = await this.actividadRepository.findOne({
        where: { id: actividadId },
      });
      if (!actividad)
        throw new NotFoundException('No se encontro la actividad.');

      const autor = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!autor)
        throw new NotFoundException(
          `No se encontró el usuario con ID ${userId}`
        );

      const nuevoComentario = this.comentarioRepository.create({
        contenido,
        actividad,
        autor,
      });
      await this.comentarioRepository.save(nuevoComentario);

      return 'Comentario creado con exito.';
    } catch (error) {
      throw error;
    }
  }

  async findAll(actividadId: string) {
    try {
      const comentarios = await this.comentarioRepository.find({
        where: { actividad: { id: actividadId } },
        relations: ['autor'],
        order: { createdAt: 'DESC' },
      });

      if (!comentarios.length) {
        throw new NotFoundException(
          'No se encontraron comentarios para esta actividad.'
        );
      }

      return comentarios;
    } catch (error) {
      throw error;
    }
  }

  async update(
    id: string,
    updateComentariosTaskDto: UpdateComentariosActividadDto
  ) {
    const { contenido } = updateComentariosTaskDto;

    try {
      const comentario = await this.comentarioRepository.findOne({
        where: { id },
        relations: ['autor'],
      });

      if (!comentario) {
        throw new NotFoundException('Comentario no encontrado.');
      }

      comentario.contenido = contenido;

      await this.comentarioRepository.save(comentario);

      return 'Comentario actualizado con éxito.';
    } catch (error) {
      throw error;
    }
  }
  async remove(id: string) {
    try {
      const comentario = await this.comentarioRepository.findOne({
        where: { id },
      });
      if (!comentario)
        throw new NotFoundException(
          'No se encontro el comentario que se desea eliminar.'
        );
      await this.comentarioRepository.remove(comentario);
      return 'Comentario eliminado exitosamente.';
    } catch (error) {
      throw error;
    }
  }
}
