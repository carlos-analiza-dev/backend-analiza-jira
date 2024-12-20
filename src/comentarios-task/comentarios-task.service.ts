import { Injectable, NotFoundException } from '@nestjs/common';

import { UpdateComentariosTaskDto } from './dto/update-comentarios-task.dto';
import { CreateComentarioDto } from './dto/create-comentarios-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Comentario } from './entities/comentarios-task.entity';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Tarea } from 'src/tareas/entities/tarea.entity';

@Injectable()
export class ComentariosTaskService {
  constructor(
    @InjectRepository(Comentario)
    private readonly comentarioRepository: Repository<Comentario>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Tarea)
    private readonly tareaRepository: Repository<Tarea>
  ) {}

  async create(tareaId: string, createComentariosTaskDto: CreateComentarioDto) {
    const { contenido, userId } = createComentariosTaskDto;

    try {
      if (!contenido)
        throw new NotFoundException(
          `No se encontró la tarea con ID ${tareaId}`
        );

      const tarea = await this.tareaRepository.findOne({
        where: { id: tareaId },
      });
      if (!tarea) throw new NotFoundException('No se encontro la tarea.');

      const autor = await this.userRepository.findOne({
        where: { id: userId },
      });
      if (!autor)
        throw new NotFoundException(
          `No se encontró el usuario con ID ${userId}`
        );

      const nuevoComentario = this.comentarioRepository.create({
        contenido,
        tarea,
        autor,
      });
      await this.comentarioRepository.save(nuevoComentario);

      return 'Comentario creado con exito.';
    } catch (error) {
      throw error;
    }
  }

  async findAll(tareaId: string) {
    try {
      const comentarios = await this.comentarioRepository.find({
        where: { tarea: { id: tareaId } },
        relations: ['autor'],
        order: { createdAt: 'DESC' },
      });

      if (!comentarios.length) {
        throw new NotFoundException(
          'No se encontraron comentarios para esta tarea.'
        );
      }

      return comentarios;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateComentariosTaskDto: UpdateComentariosTaskDto) {
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
