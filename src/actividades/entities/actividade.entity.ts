import { User } from 'src/auth/entities/user.entity';
import { Evento } from 'src/evento/entities/evento.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('actividades')
export class Actividade {
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

  @ManyToOne(() => User, { eager: true, nullable: true })
  actualizadoPor: User;

  @ManyToOne(() => User, (usuario) => usuario.actividades, { eager: true })
  usuarioAsignado: User;

  @ManyToOne(() => Evento, (evento) => evento.actividad)
  evento: Evento;

  @ManyToOne(() => User, (usuario) => usuario.actividad, { eager: true })
  creador: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
