import { User } from 'src/auth/entities/user.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Sucursal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true })
  nombre: string;

  @Column({ type: 'varchar' })
  departamento: string;

  @Column({ type: 'varchar', nullable: true })
  pais: string;

  @Column({ type: 'varchar' })
  direccion: string;

  @OneToMany(() => User, (user) => user.sucursal)
  users: [];
}
