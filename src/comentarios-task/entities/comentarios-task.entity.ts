import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { User } from 'src/auth/entities/user.entity';
import { Tarea } from 'src/tareas/entities/tarea.entity';

@Entity('comentarios-task')
export class Comentario {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  contenido: string;

  @ManyToOne(() => Tarea, (tarea) => tarea.comentarios, { onDelete: 'CASCADE' })
  tarea: Tarea;

  @ManyToOne(() => User, { eager: true })
  autor: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
