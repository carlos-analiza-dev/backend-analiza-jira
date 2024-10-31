import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('empresa')
export class Empresa {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  nombre: string;

  @Column()
  descripcion: string;

  @Column({ type: 'enum', enum: ['Activa', 'Inactiva'], default: 'Activa' })
  estado: string;

  @OneToMany(() => Proyecto, (proyecto) => proyecto.empresa)
  proyectos: Proyecto[];
}
