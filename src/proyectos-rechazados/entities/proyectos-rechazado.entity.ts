import { User } from 'src/auth/entities/user.entity';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('rechazos_proyectos')
export class ProyectosRechazado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.rechazos, {
    onDelete: 'CASCADE',
  })
  proyecto: Proyecto;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  usuario: User;

  @CreateDateColumn({ type: 'timestamp' })
  fechaRechazo: Date;

  @Column({ type: 'text', nullable: true })
  motivoRechazo?: string;
}
