import { Actividade } from 'src/actividades/entities/actividade.entity';
import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('comentarios-activid')
export class ComentariosActividad {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contenido: string;

  @ManyToOne(() => Actividade, (tarea) => tarea.comentarios, {
    onDelete: 'CASCADE',
  })
  actividad: Actividade;

  @ManyToOne(() => User, { eager: true })
  autor: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
