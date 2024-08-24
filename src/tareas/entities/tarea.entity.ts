
import { User } from 'src/auth/entities/user.entity';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tareas')
export class Tarea {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @Column({ type: 'enum', enum: ['Nueva', 'En Progreso', 'Finalizada'], default: 'Nueva' })
  estado: string;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.tareas)
  proyecto: Proyecto;

  @ManyToOne(() => User, (user) => user.tareas)
  usuario: User;
}
