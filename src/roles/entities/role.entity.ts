import { User } from 'src/auth/entities/user.entity';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity'; // Importar la entidad Proyecto
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  nombre: string;

  @Column({ type: 'varchar', nullable: true })
  pais: string;

  @OneToMany(() => User, (user) => user.role)
  users: User[];

  @OneToMany(() => Proyecto, (proyecto) => proyecto.rolDirigido)
  proyectos: Proyecto[];
}
