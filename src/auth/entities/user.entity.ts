import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Sucursal } from 'src/sucursal/entities/sucursal.entity';
import { Tarea } from 'src/tareas/entities/tarea.entity';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;
  @Column({ type: 'varchar', length: 255 })
  nombre: string;
  @Column({ type: 'varchar', unique: true })
  correo: string;
  @Column({ type: 'varchar', length: 255, select: false })
  password: string;
  @Column('text')
  sexo: string;
  @Column({ type: 'integer' })
  edad: number;
  @Column({ type: 'varchar', unique: true })
  dni: string;
  @Column({ type: 'varchar', length: 255 })
  direccion: string;
  @Column({ type: 'int', default: 0 })
  autorizado: number;
  @Column({ type: 'int', default: 1 })
  isActive: number;

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.users, { eager: true })
  sucursal: Sucursal;

  @ManyToOne(() => Proyecto, (proyecto) => proyecto.usuarios, { eager: true })
proyecto: Proyecto;

@OneToMany(() => Tarea, (tarea) => tarea.usuario)
tareas: Tarea[];

  @BeforeInsert()
  checkCorreo() {
    this.correo = this.correo.toLowerCase().trim();
  }
  @BeforeUpdate()
  checkCorreoUpdate() {
    this.checkCorreo();
  }
}
