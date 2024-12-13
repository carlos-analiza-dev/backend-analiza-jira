import { User } from 'src/auth/entities/user.entity';
import { Evento } from 'src/evento/entities/evento.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('rechazos_eventos')
export class EventosRechazado {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Evento, (proyecto) => proyecto.rechazos, {
    onDelete: 'CASCADE',
  })
  evento: Evento;

  @ManyToOne(() => User, { eager: true, onDelete: 'CASCADE' })
  usuario: User;

  @CreateDateColumn({ type: 'timestamp' })
  fechaRechazo: Date;

  @Column({ type: 'text', nullable: true })
  motivoRechazo?: string;
}
