import { User } from 'src/auth/entities/user.entity';
import { ComentariosActividad } from 'src/comentarios-actividad/entities/comentarios-actividad.entity';
import { Evento } from 'src/evento/entities/evento.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
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

  @Column({
    type: 'enum',
    enum: ['Baja', 'Media', 'Alta', 'Critica'],
    default: 'Baja',
  })
  prioridad: string;

  @ManyToOne(() => User, { eager: true, nullable: true })
  actualizadoPor: User;

  @OneToMany(() => ComentariosActividad, (comentario) => comentario.actividad, {
    cascade: true,
    eager: true,
  })
  comentarios: ComentariosActividad[];

  @Column({ type: 'timestamp' })
  fechaInicio: Date;

  @Column({ type: 'timestamp' })
  fechaFin: Date;

  @ManyToOne(() => User, (usuario) => usuario.actividades, { eager: true })
  usuarioAsignado: User;

  @ManyToOne(() => Actividade, { nullable: true })
  actividadDependencia: Actividade;

  @ManyToOne(() => Evento, (evento) => evento.actividad)
  evento: Evento;

  @ManyToOne(() => User, (usuario) => usuario.actividad, { eager: true })
  creador: User;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}
