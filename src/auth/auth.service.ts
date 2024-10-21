import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
import { error } from 'console';

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
      } = createUserDto;

      // Encriptar contraseña
      const passwordHash = bcrypt.hashSync(password, 10);

      // Si roleId está presente, buscar el rol
      let role = null;
      if (roleId) {
        role = await this.rolRepository.findOne({ where: { id: roleId } });
        if (!role) {
          throw new Error('Role no encontrado');
        }
      }

      // Si sucursalId está presente, buscar la sucursal
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

      // Crear el usuario
      const user = this.userReository.create({
        nombre,
        correo,
        dni,
        direccion,
        edad,
        password: passwordHash,
        sexo,
        role,
        sucursal,
      });

      // Guardar el usuario en la base de datos
      await this.userReository.save(user);

      // Eliminar la contraseña antes de devolver el usuario
      delete user.password;

      // Retornar el usuario junto con el token JWT
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
      relations: ['rolDirigido', 'responsable'],
    });

    if (!proyecto) {
      throw new NotFoundException(`Proyecto con id ${projectId} no encontrado`);
    }

    const { rolDirigido, responsable } = proyecto;

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

    const filteredUsers = users.filter((user) => user.id !== responsable.id);

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
    } = paginationDto;

    let queryUsers = this.userReository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.role', 'role') // Cambiado a leftJoinAndSelect
      .leftJoinAndSelect('user.sucursal', 'sucursal') // Cambiado a leftJoinAndSelect
      .take(limit)
      .skip(offset)
      .where('user.id != :userId', { userId: user.id }); // Excluir el usuario activo

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

    if (correo) {
      queryUsers = queryUsers.andWhere('user.correo = :correo', { correo });
    }

    const users = await queryUsers.getMany();

    // Consulta para obtener el total de usuarios filtrados, excluyendo al usuario actual
    const totalQuery = this.userReository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .leftJoin('user.sucursal', 'sucursal')
      .where('user.id != :userId', { userId: user.id }); // Excluir el usuario activo

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

    const total = await totalQuery.getCount();

    if (!users || users.length === 0) {
      throw new BadRequestException('No se encontraron usuarios');
    }

    return {
      data: users,
      total,
    };
  }

  async findAllUsers() {
    try {
      const users = await this.userReository.find({});
      if (!users || users.length === 0)
        throw new NotFoundException('No se encontraron usuarios');
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

      const usuariosFiltrados = usuariosActivos.filter(
        (usuario) => usuario.id !== user.id
      );

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

  async findAllUsersByEventos(eventoId: string) {
    const evento = await this.eventoRepository.findOne({
      where: { id: eventoId },
      relations: ['usuarioCreador', 'responsable'],
    });

    if (!evento) {
      throw new NotFoundException(`Evento con id ${eventoId} no encontrado`);
    }

    const { usuarioCreador, responsable } = evento;

    const usuarios = await this.userReository.find({
      where: {
        isActive: 1,
        autorizado: 1,
      },
    });

    const usuariosFiltrados = usuarios.filter((usuario) => {
      const isCreador = usuarioCreador
        ? usuario.id === usuarioCreador.id
        : false;
      const isResponsable = responsable ? usuario.id === responsable.id : false;
      return !isCreador && !isResponsable;
    });

    if (usuariosFiltrados.length === 0) {
      throw new NotFoundException('No se encontraron usuarios disponibles');
    }

    return usuariosFiltrados;
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
    } = paginationDto;

    let queryUsers = this.userReository
      .createQueryBuilder('user')
      .where('user.autorizado = :autorizado', { autorizado: 0 })
      .leftJoin('user.role', 'role')
      .addSelect('role.nombre')
      .innerJoin('user.sucursal', 'sucursal')
      .addSelect(['sucursal.nombre'])
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

    const [users, total] = await queryUsers.getManyAndCount();

    if (!users || users.length === 0) {
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
    if (!obtenerUsuario)
      throw new NotFoundException(
        `No se encontro el usuario con el correo: ${correo}`
      );

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
      rol,
      roleId,
      sexo,
      sucursalId,
    } = updateUserDto;
    // Buscar el usuario junto con las relaciones
    const user = await this.userReository.findOne({
      where: { id },
      relations: ['role', 'sucursal'],
    });

    if (!user) {
      throw new BadRequestException(
        `No se encontró el usuario con el id: ${id}`
      );
    }

    // Asignar propiedades del DTO
    Object.assign(user, {
      nombre: nombre,
      correo: correo,
      dni: dni,
      direccion: direccion,
      edad: edad,
      autorizado: autorizado,
      isActive: isActive,
      password: password,
      rol: rol,
      roleId: roleId,
      sexo: sexo,
      sucursalId: sucursalId,
    });

    // Verificar si se está actualizando el rol
    if (updateUserDto.roleId) {
      const role = await this.rolRepository.findOne({
        where: { id: updateUserDto.roleId }, // Usar roleId en lugar de rol
      });
      if (role) {
        user.role = role;
      } else {
        throw new BadRequestException(
          `No se encontró el rol con el id: ${updateUserDto.roleId}`
        );
      }
    }

    // Verificar si se está actualizando la sucursal
    if (updateUserDto.sucursalId) {
      const sucursal = await this.sucursalRepository.findOne({
        where: { id: updateUserDto.sucursalId }, // Usar sucursalId
      });
      if (sucursal) {
        user.sucursal = sucursal;
      } else {
        throw new BadRequestException(
          `No se encontró la sucursal con el id: ${updateUserDto.sucursalId}`
        );
      }
    }

    // Guardar el usuario actualizado
    return this.userReository.save(user);
  }

  async findAllActiveUsers() {
    const usuariosActivos = await this.userReository.find({
      where: { isActive: 1 },
    });
    const usuariosInactivos = await this.userReository.find({
      where: { isActive: 0 },
    });
    return {
      activos: usuariosActivos.length,
      inactivos: usuariosInactivos.length,
    };
  }

  async findAllUsersBySucursal() {
    try {
      const usersBySucursal = await this.userReository
        .createQueryBuilder('user')
        .where('user.isActive = :isActive', { isActive: 1 })
        .leftJoinAndSelect('user.sucursal', 'sucursal')
        .select('sucursal.nombre', 'sucursal')
        .addSelect('COUNT(user.id)', 'cantidadUsuarios')
        .groupBy('sucursal.nombre')
        .getRawMany();

      return usersBySucursal;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findAllUserAutorizados() {
    const usersAutorizados = await this.userReository.find({
      where: { autorizado: 1 },
    });
    const usersNoAutorizados = await this.userReository.find({
      where: { autorizado: 0 },
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

    // Aquí se eliminarán automáticamente las relaciones si están configuradas correctamente.
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
