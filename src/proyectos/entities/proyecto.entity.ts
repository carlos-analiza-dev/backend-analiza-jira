import { User } from 'src/auth/entities/user.entity';
import { Tarea } from 'src/tareas/entities/tarea.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  cliente: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({
    type: 'enum',
    enum: ['En Progreso', 'Finalizado'],
    default: 'En Progreso',
  })
  estado: string;

  @CreateDateColumn({ type: 'timestamp' })
  fechaCreacion?: Date;

  @ManyToOne(() => User, (user) => user.proyectosCreados, { eager: true })
  creador: User;

  @ManyToMany(() => User, (user) => user.proyectos)
  @JoinTable()
  usuarios: User[];

  @OneToMany(() => Tarea, (tarea) => tarea.proyecto)
  tareas: Tarea[];
}
