import { User } from 'src/auth/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
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
    enum: ['Activo', 'Cancelado', 'Pospuesto'],
    default: 'Activo',
  })
  estado?: string;

  @CreateDateColumn()
  creadoEn: Date;

  @UpdateDateColumn()
  actualizadoEn: Date;

  @ManyToOne(() => User, (user) => user.eventos)
  usuarioCreador: User;
}
