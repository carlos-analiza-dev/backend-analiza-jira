import { Evento } from 'src/evento/entities/evento.entity';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Sucursal } from 'src/sucursal/entities/sucursal.entity';
import { Tarea } from 'src/tareas/entities/tarea.entity';
import { UserRole } from 'src/types/user.role.type';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  ManyToMany,
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

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  rol: UserRole;

  @OneToMany(() => Tarea, (tarea) => tarea.creador)
  tareasCreadas: Tarea[];

  @ManyToOne(() => Role, (role) => role.users, { eager: true })
  role: Role;

  @ManyToOne(() => Sucursal, (sucursal) => sucursal.users)
  sucursal: Sucursal;

  @OneToMany(() => Evento, (evento) => evento.usuarioCreador)
  eventos: Evento[];

  @ManyToMany(() => Proyecto, (proyecto) => proyecto.usuarios)
  proyectos: Proyecto[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.creador)
  proyectosCreados: Proyecto[];

  @BeforeInsert()
  setDefaultRole() {
    if (!this.role) {
      this.rol = UserRole.USER;
    }
  }

  @BeforeInsert()
  checkCorreo() {
    this.correo = this.correo.toLowerCase().trim();
  }
  @BeforeUpdate()
  checkCorreoUpdate() {
    this.checkCorreo();
  }
}
