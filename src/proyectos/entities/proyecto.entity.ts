import { User } from 'src/auth/entities/user.entity';
import { Tarea } from 'src/tareas/entities/tarea.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('proyectos')
export class Proyecto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  nombre: string;

  @Column({ type: 'text' })
  descripcion: string;

  @OneToMany(() => User, (user) => user.proyecto)
  usuarios: User[];

  @OneToMany(() => Tarea, (tarea) => tarea.proyecto)
  tareas: Tarea[];
}
