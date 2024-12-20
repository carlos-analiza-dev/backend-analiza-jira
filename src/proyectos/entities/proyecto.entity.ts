import { User } from 'src/auth/entities/user.entity';
import { Empresa } from 'src/empresa/entities/empresa.entity';
import { ProyectosRechazado } from 'src/proyectos-rechazados/entities/proyectos-rechazado.entity';
import { Role } from 'src/roles/entities/role.entity';
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

  @Column({
    type: 'enum',
    enum: ['Pendiente', 'Rechazado', 'Aceptado'],
    default: 'Pendiente',
  })
  statusProject: string;

  @Column({
    type: 'text',
    default: 'Sin detalle',
  })
  justificacion?: string;

  @CreateDateColumn({ type: 'timestamp' })
  fechaCreacion?: Date;

  @ManyToOne(() => User, (user) => user.proyectosCreados, { eager: true })
  creador: User;

  @ManyToMany(() => User, (user) => user.proyectos, { eager: true })
  @JoinTable()
  usuarios: User[];

  @OneToMany(() => Tarea, (tarea) => tarea.proyecto)
  tareas: Tarea[];

  @OneToMany(
    () => ProyectosRechazado,
    (rechazoProyecto) => rechazoProyecto.proyecto
  )
  rechazos: ProyectosRechazado[];

  @ManyToOne(() => User, { eager: true })
  responsable: User;

  @ManyToOne(() => Role, (role) => role.proyectos, { eager: true })
  rolDirigido: Role;

  @ManyToOne(() => Empresa, (empresa) => empresa.proyectos, { eager: true })
  empresa: Empresa;
}
