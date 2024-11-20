import { User } from 'src/auth/entities/user.entity';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tareas')
export class Tarea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: ['Nueva', 'Recibida', 'EnProgreso', 'Finalizada'],
    default: 'Nueva',
  })
  estado: string;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.tareas, { eager: true })
  proyecto: Proyecto;

  @ManyToOne(() => User, (user) => user.tareasCreadas, { eager: true })
  creador: User;

  @ManyToOne(() => User, { eager: true, nullable: true })
  actualizadoPor: User;

  @ManyToOne(() => User, (usuario) => usuario.tareas, { eager: true })
  usuarioAsignado: User;

  @ManyToOne(() => Tarea, { nullable: true })
  tareaDependencia: Tarea;

  @Column({ type: 'timestamp' })
  fechaInicio: Date;

  @Column({ type: 'timestamp' })
  fechaFin: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
