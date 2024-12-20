import { Actividade } from 'src/actividades/entities/actividade.entity';
import { User } from 'src/auth/entities/user.entity';
import { EventosRechazado } from 'src/eventos-rechazados/entities/eventos-rechazado.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('evento')
export class Evento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar' })
  descripcion: string;

  @Column({ type: 'timestamp' })
  fechaInicio: Date;

  @Column({ type: 'timestamp' })
  fechaFin: Date;

  @Column({
    type: 'enum',
    enum: ['Conferencia', 'Seminario', 'Festivo', 'Virtual'],
    default: 'Conferencia',
  })
  tipoEvento: string;

  @Column({
    type: 'enum',
    enum: ['Activo', 'Finalizado', 'Pospuesto'],
    default: 'Activo',
  })
  estado?: string;

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'Rechazado', 'Aceptado'],
    default: 'Pendiente',
  })
  statusEvento: string;

  @Column({
    type: 'text',
    default: 'Sin detalle',
  })
  justificacion?: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @ManyToOne(() => User, (user) => user.eventos, { eager: true })
  usuarioCreador: User;

  @ManyToMany(() => User, (user) => user.evento, { eager: true })
  @JoinTable()
  usuarios: User[];

  @ManyToOne(() => User, { eager: true })
  responsable: User;

  @OneToMany(() => EventosRechazado, (rechazoEvento) => rechazoEvento.evento)
  rechazos: EventosRechazado[];

  @OneToMany(() => Actividade, (actividad) => actividad.evento)
  actividad: Actividade[];
}
