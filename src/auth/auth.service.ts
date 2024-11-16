import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from 'src/roles/entities/role.entity';
import { Sucursal } from 'src/sucursal/entities/sucursal.entity';
import { MailService } from 'src/mail/mail.service';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CorreoDto } from './dto/correo-user.dto';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import { SendMailDto } from './dto/reset-password.dto';
import { Evento } from 'src/evento/entities/evento.entity';
import { UserRole } from 'src/types/user.role.type';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userReository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolRepository: Repository<Role>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
    @InjectRepository(Proyecto)
    private readonly proyectoRepository: Repository<Proyecto>,
    @InjectRepository(Evento)
    private readonly eventoRepository: Repository<Evento>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const {
        nombre,
        correo,
        dni,
        direccion,
        edad,
        password,
        sexo,
        roleId,
        sucursalId,
        rol,
        pais,
        empresa,
      } = createUserDto;

      let userRole: UserRole;

      if (rol === 'Administrador') {
        userRole = UserRole.ADMIN;
      } else if (rol === 'Gerente') {
        userRole = UserRole.GERENTE;
      } else {
        userRole = UserRole.USER;
      }

      const passwordHash = bcrypt.hashSync(password, 10);

      let role = null;
      if (roleId) {
        role = await this.rolRepository.findOne({ where: { id: roleId } });
        if (!role) {
          throw new Error('Role no encontrado');
        }
      }

      let sucursal = null;
      if (sucursalId) {
        sucursal = await this.sucursalRepository.findOne({
          where: { id: sucursalId },
        });
        if (!sucursal) {
          throw new Error('Sucursal no encontrada');
        }
      }

      const dniDuplicate = await this.userReository.findOne({ where: { dni } });
      if (dniDuplicate)
        throw new BadRequestException(
          'El dni que ingresaste ya existe en la base de datos'
        );

      const correoDuplicate = await this.userReository.findOne({
        where: { correo },
      });
      if (correoDuplicate)
        throw new BadRequestException(
          'El correo que ingresaste ya existe en la base de datos'
        );

      const user = this.userReository.create({
        nombre,
        correo,
        dni,
        direccion,
        edad,
        password: passwordHash,
        sexo,
        rol: userRole,
        role,
        sucursal,
        pais,
        empresa,
      });

      await this.userReository.save(user);

      delete user.password;

      return { ...user, token: this.getJwtPayload({ id: user.id }) };
    } catch (error) {
      throw error;
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { correo, password } = loginUserDto;
    try {
      const user = await this.userReository.findOne({
        where: { correo },
        select: {
          correo: true,
          password: true,
          isActive: true,
          autorizado: true,
          nombre: true,
          rol: true,
          dni: true,
          id: true,
          pais: true,
          empresa: true,
        },
      });

      if (!user)
        throw new UnauthorizedException('Credenciales invalidas (correo)');

      if (!bcrypt.compareSync(password, user.password))
        throw new UnauthorizedException('Credenciales invalidas (contrasena)');

      if (user.autorizado === 0)
        throw new UnauthorizedException(
          'No has sido autorizado por el administrador'
        );

      if (user.isActive === 0) {
        throw new UnauthorizedException(
          'No has sido activado por el administrador'
        );
      }
      delete user.password;
      return { ...user, token: this.getJwtPayload({ id: user.id }) };
    } catch (error) {
      throw error;
    }
  }

  async findUsersByProjectRole(projectId: string) {
    const proyecto = await this.proyectoRepository.findOne({
      where: { id: projectId },
      relations: ['rolDirigido', 'responsable', 'usuarios'],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con id ${projectId} no encontrado`);
    }

    const { rolDirigido, responsable, usuarios } = proyecto;

    const users = await this.userReository.find({
      where: {
        role: rolDirigido,
        isActive: 1,
        autorizado: 1,
      },
      relations: ['role'],
    });

    if (!users.length) {
      throw new NotFoundException(
        `No se encontraron usuarios con el departamento del proyecto ${projectId}`
      );
    }

    const filteredUsers = users.filter(
      (user) =>
        user.id !== responsable.id &&
        !usuarios.some((colaborador) => colaborador.id === user.id)
    );

    return filteredUsers;
  }

  async sendMail(correo: string) {
    if (!correo)
      throw new BadRequestException('No se proporciono un correo electronico');
    try {
      const response = await this.mailService.sendEmail(correo);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  async actualizarContrasena(updatePassword: UpdatePasswordDto) {
    const { correo, nuevaContrasena } = updatePassword;
    const usuario = await this.userReository.findOne({ where: { correo } });

    if (!usuario) {
      throw new NotFoundException('El correo no existe en la base de datos');
    }

    const hashedPassword = await bcrypt.hash(nuevaContrasena, 10);
    usuario.password = hashedPassword;

    await this.mailService.sendEmailConfirm(correo, nuevaContrasena);
    await this.userReository.save(usuario);
    return 'Contraseña actualizada exitosamente';
  }

  private getJwtPayload(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findAll(paginationDto: PaginationDto, user: User) {
    const {
      limit = 5,
      offset = 0,
      sexo,
      sucursal,
      role,
      correo,
      pais,
    } = paginationDto;

    let queryUsers = this.userReository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.sucursal', 'sucursal')
      .take(limit)
      .skip(offset)
      .where('user.id != :userId', { userId: user.id });

    if (user.rol === UserRole.ADMIN) {
      queryUsers = queryUsers.andWhere('rol != :rol', { rol: 'Manager' });
    }

    if (sexo) {
      queryUsers = queryUsers.andWhere('user.sexo = :sexo', { sexo });
    }

    if (sucursal) {
      queryUsers = queryUsers.andWhere('sucursal.nombre = :sucursal', {
        sucursal,
      });
    }

    if (correo) {
      queryUsers = queryUsers.andWhere('user.correo = :correo', { correo });
    }

    if (pais) {
      queryUsers = queryUsers.andWhere('user.pais = :pais', { pais });
    }

    if (role) {
      queryUsers = queryUsers.andWhere('role.nombre = :role', { role });
    }

    const users = await queryUsers.getMany();

    const totalQuery = this.userReository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .leftJoin('user.sucursal', 'sucursal')
      .where('user.id != :userId', { userId: user.id });

    if (sexo) {
      totalQuery.andWhere('user.sexo = :sexo', { sexo });
    }

    if (sucursal) {
      totalQuery.andWhere('sucursal.nombre = :sucursal', { sucursal });
    }

    if (role) {
      totalQuery.andWhere('role.nombre = :role', { role });
    }

    if (correo) {
      totalQuery.andWhere('user.correo = :correo', { correo });
    }

    if (pais) {
      totalQuery.andWhere('user.pais = :pais', { pais });
    }

    const total = await totalQuery.getCount();

    if (!users || users.length === 0) {
      throw new BadRequestException('No se encontraron usuarios');
    }

    return {
      data: users,
      total,
    };
  }

  async findAllUsers(paginationDto: PaginationDto, user: User) {
    const { pais } = paginationDto;

    try {
      const whereCondition = pais ? { pais } : {};

      if (user.rol === UserRole.ADMIN) {
        whereCondition['rol'] = Not(UserRole.MANAGER);
      }

      whereCondition['id'] = Not(user.id);

      const users = await this.userReository.find({
        where: whereCondition,
      });

      if (!users || users.length === 0) {
        throw new NotFoundException('No se encontraron usuarios');
      }

      return users;
    } catch (error) {
      throw error;
    }
  }

  async findAllUsersActive(user: User) {
    try {
      const usuariosActivos = await this.userReository.find({
        where: { isActive: 1, autorizado: 1 },
      });

      if (!usuariosActivos || usuariosActivos.length === 0) {
        throw new NotFoundException('No se encontraron usuarios disponibles');
      }

      let usuariosFiltrados = usuariosActivos.filter(
        (usuario) => usuario.id !== user.id
      );

      if (user.rol === UserRole.ADMIN) {
        usuariosFiltrados = usuariosFiltrados.filter(
          (usuario) => usuario.rol !== UserRole.MANAGER
        );
      }

      if (usuariosFiltrados.length === 0) {
        throw new NotFoundException(
          'No se encontraron otros usuarios disponibles'
        );
      }

      return usuariosFiltrados;
    } catch (error) {
      throw error;
    }
  }

  async findAllUsersEmpresa(): Promise<{ empresa: string; count: number }[]> {
    const result = await this.userReository
      .createQueryBuilder('user')
      .select('user.empresa', 'empresa')
      .addSelect('COUNT(user.id)', 'count')
      .groupBy('user.empresa')
      .where('user.isActive = :isActive', { isActive: 1 })
      .andWhere('user.autorizado = :autorizado', { autorizado: 1 })
      .getRawMany();

    return result.map((row) => ({
      empresa: row.empresa,
      count: Number(row.count),
    }));
  }

  async findAllUsersRol(
    pais?: string
  ): Promise<{ role: string; count: number }[]> {
    const query = this.userReository
      .createQueryBuilder('user')
      .innerJoinAndSelect('user.role', 'role')
      .select('role.nombre', 'role')
      .addSelect('COUNT(user.id)', 'count')
      .where('user.isActive = :isActive', { isActive: 1 })
      .andWhere('user.autorizado = :autorizado', { autorizado: 1 });

    if (pais) {
      query.andWhere('user.pais = :pais', { pais });
    }

    query.groupBy('role.nombre');

    const result = await query.getRawMany();

    return result
      .map((row) => ({
        role: row.role,
        count: Number(row.count),
      }))
      .filter((row) => row.count > 0);
  }

  async findAllUsersByEventos(eventoId: string) {
    const evento = await this.eventoRepository.findOne({
      where: { id: eventoId },
      relations: ['usuarioCreador', 'responsable', 'usuarios'],
    });

    if (!evento) {
      throw new NotFoundException(`Evento con id ${eventoId} no encontrado`);
    }

    const colaboradoresIds = [
      evento.usuarioCreador?.id,
      evento.responsable?.id,
      ...evento.usuarios.map((colaborador) => colaborador.id),
    ].filter(Boolean);

    const usuarios = await this.userReository.find({
      where: {
        isActive: 1,
        autorizado: 1,
        id: Not(In(colaboradoresIds)),
      },
    });

    if (usuarios.length === 0) {
      throw new NotFoundException('No se encontraron usuarios disponibles');
    }

    return usuarios;
  }

  async findByEmail(sendMailDto: SendMailDto) {
    const { correo } = sendMailDto;

    if (!correo) {
      throw new BadRequestException('No se proporcionó un correo electrónico');
    }

    const user = await this.userReository.findOne({
      where: {
        correo: correo,
        isActive: 1,
        autorizado: 1,
      },
      relations: ['role', 'sucursal'],
    });

    if (!user) {
      throw new NotFoundException(
        `Usuario con el correo ${correo} no encontrado o no autorizado`
      );
    }

    return user;
  }

  async findAllByRol(paginationDto: PaginationDto) {
    const { sexo, sucursal, role } = paginationDto;

    let queryUsers = this.userReository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .addSelect('role.nombre')
      .leftJoin('user.sucursal', 'sucursal')
      .addSelect('sucursal.nombre')
      .where('user.autorizado = :autorizado', { autorizado: 1 })
      .andWhere('user.isActive = :isActive', { isActive: 1 });

    if (sexo) {
      queryUsers = queryUsers.andWhere('user.sexo = :sexo', { sexo });
    }

    if (sucursal) {
      queryUsers = queryUsers.andWhere('sucursal.nombre = :sucursal', {
        sucursal,
      });
    }

    if (role) {
      queryUsers = queryUsers.andWhere('role.nombre = :role', { role });
    }

    const users = await queryUsers.getMany();

    const total = await this.userReository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .leftJoin('user.sucursal', 'sucursal')
      .where('user.autorizado = :autorizado', { autorizado: 1 })
      .andWhere('user.isActive = :isActive', { isActive: 1 })
      .andWhere(sexo ? 'user.sexo = :sexo' : '1=1', { sexo })
      .andWhere(sucursal ? 'sucursal.nombre = :sucursal' : '1=1', { sucursal })
      .andWhere(role ? 'role.nombre = :role' : '1=1', { role })
      .getCount();

    if (!users || users.length === 0) {
      throw new BadRequestException('No se encontraron usuarios');
    }

    return {
      data: users,
      total,
    };
  }

  async findAllAutorizar(paginationDto: PaginationDto) {
    const {
      limit = 5,
      offset = 0,
      sexo,
      departamento,
      sucursal,
      pais,
    } = paginationDto;

    let queryUsers = this.userReository
      .createQueryBuilder('user')
      .where('user.autorizado = :autorizado', { autorizado: 0 })
      .leftJoin('user.role', 'role')
      .addSelect('role.nombre')
      .leftJoin('user.sucursal', 'sucursal')
      .addSelect('sucursal.nombre')
      .take(limit)
      .skip(offset);

    if (sexo) {
      queryUsers = queryUsers.andWhere('user.sexo = :sexo', { sexo });
    }

    if (departamento) {
      queryUsers = queryUsers.andWhere('role.nombre = :departamento', {
        departamento,
      });
    }

    if (sucursal) {
      queryUsers = queryUsers.andWhere('sucursal.nombre = :sucursal', {
        sucursal,
      });
    }

    if (pais) {
      queryUsers = queryUsers.andWhere('user.pais = :pais', { pais });
    }

    const [users, total] = await queryUsers.getManyAndCount();

    if (users.length === 0) {
      throw new BadRequestException('No se encontraron usuarios');
    }

    return {
      data: users,
      total,
    };
  }

  async obtenerUserByEmail(correoDto: CorreoDto, user: User) {
    const { correo } = correoDto;

    if (!user?.correo || !correo) {
      throw new BadRequestException('Datos inválidos');
    }

    if (user.correo.trim().toLowerCase() === correo.trim().toLowerCase()) {
      throw new BadRequestException('No es posible asignarte ti mismo');
    }

    const obtenerUsuario = await this.userReository.findOneBy({ correo });

    if (!obtenerUsuario) {
      throw new NotFoundException(
        `No se encontró el usuario con el correo: ${correo}`
      );
    }

    if (
      user.rol === UserRole.ADMIN ||
      (user.rol === UserRole.USER && obtenerUsuario.rol === UserRole.MANAGER)
    ) {
      throw new BadRequestException(
        'No se puede buscar un usuario con rol de Manager'
      );
    }

    if (obtenerUsuario.autorizado === 0 || obtenerUsuario.isActive === 0) {
      throw new UnauthorizedException('Usuario no autorizado');
    }

    return obtenerUsuario;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const {
      correo,
      autorizado,
      direccion,
      dni,
      edad,
      isActive,
      nombre,
      password,
      sexo,
      roleId,
      sucursalId,
    } = updateUserDto;

    try {
      const user = await this.userReository.findOne({
        where: { id },
        relations: ['role', 'sucursal'],
      });

      if (!user) {
        throw new BadRequestException(
          `No se encontró el usuario con el id: ${id}`
        );
      }

      Object.assign(user, {
        ...(nombre && { nombre }),
        ...(correo && { correo }),
        ...(dni && { dni }),
        ...(direccion && { direccion }),
        ...(edad && { edad }),
        ...(autorizado !== undefined && { autorizado }),
        ...(isActive !== undefined && { isActive }),
        ...(password && { password }),
        ...(sexo && { sexo }),
      });

      if (roleId) {
        const role = await this.rolRepository.findOne({
          where: { id: roleId },
        });
        if (role) {
          user.role = role;
        } else {
          throw new BadRequestException(
            `No se encontró el rol con el id: ${roleId}`
          );
        }
      }

      if (sucursalId) {
        const sucursal = await this.sucursalRepository.findOne({
          where: { id: sucursalId },
        });
        if (sucursal) {
          user.sucursal = sucursal;
        } else {
          throw new BadRequestException(
            `No se encontró la sucursal con el id: ${sucursalId}`
          );
        }
      }

      return await this.userReository.save(user);
    } catch (error) {
      throw error;
    }
  }

  async findAllActiveUsers(paginationDto: PaginationDto) {
    const { pais } = paginationDto;

    const usuariosActivos = await this.userReository.find({
      where: {
        isActive: 1,
        pais: pais,
      },
    });

    const usuariosInactivos = await this.userReository.find({
      where: {
        isActive: 0,
        pais: pais,
      },
    });

    return {
      activos: usuariosActivos.length,
      inactivos: usuariosInactivos.length,
    };
  }

  async findAllUsersBySucursal(paginationDto: PaginationDto) {
    const { pais } = paginationDto;

    try {
      const usersBySucursal = await this.userReository
        .createQueryBuilder('user')
        .where('user.isActive = :isActive', { isActive: 1 })
        .leftJoinAndSelect('user.sucursal', 'sucursal')

        .andWhere(pais ? 'sucursal.pais = :pais' : '1=1', { pais })

        .select('sucursal.nombre', 'sucursal')
        .addSelect('COUNT(user.id)', 'cantidadUsuarios')

        .groupBy('sucursal.nombre')
        .getRawMany();

      return usersBySucursal;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllUserAutorizados(paginationDto: PaginationDto) {
    const { pais } = paginationDto;

    const usersAutorizados = await this.userReository.find({
      where: {
        autorizado: 1,
        pais: pais,
      },
    });

    const usersNoAutorizados = await this.userReository.find({
      where: {
        autorizado: 0,
        pais: pais,
      },
    });

    return {
      autorizado: usersAutorizados.length,
      no_autorizado: usersNoAutorizados.length,
    };
  }

  async findOne(id: string) {
    const user = await this.userReository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('No se pudo encontrar el usuario.');
    return user;
  }

  async remove(id: string) {
    const user = await this.userReository.findOne({
      where: { id },
      relations: ['tareasCreadas', 'eventos', 'proyectos', 'actividades'],
    });

    if (!user) {
      throw new NotFoundException(
        'No se encontró el usuario que se desea eliminar'
      );
    }

    await this.userReository.remove(user);

    return 'Usuario Eliminado Exitosamente';
  }

  private handleError(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException(
      'Hubo un error interno en el servidor, por favor revisalo'
    );
  }
}
