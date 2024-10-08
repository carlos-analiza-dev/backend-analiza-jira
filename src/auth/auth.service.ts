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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userReository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolRepository: Repository<Role>,
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
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
      const passwordHash = bcrypt.hashSync(password, 10);
      const role = await this.rolRepository.findOne({ where: { id: roleId } });
      if (!role) {
        throw new Error('Role no encontrado');
      }
      const sucursal = await this.sucursalRepository.findOne({
        where: { id: sucursalId },
      });
      const user = this.userReository.create({
        nombre: nombre,
        correo: correo,
        dni: dni,
        direccion: direccion,
        edad: edad,
        password: passwordHash,
        sexo: sexo,
        role,
        sucursal,
      });
      await this.userReository.save(user);
      delete user.password;
      return { ...user, token: this.getJwtPayload({ id: user.id }) };
    } catch (error) {
      this.handleError(error);
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
      delete user.password;
      return { ...user, token: this.getJwtPayload({ id: user.id }) };
    } catch (error) {
      this.handleError(error);
    }
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

  async findAll(paginationDto: PaginationDto) {
    const { limit = 5, offset = 0, sexo } = paginationDto;
    let queryUsers = this.userReository
      .createQueryBuilder('user')
      .leftJoin('user.role', 'role')
      .addSelect('role.nombre')
      .leftJoin('user.sucursal', 'sucursal')
      .addSelect('sucursal.nombre')

      .take(limit)
      .skip(offset);
    if (sexo) {
      queryUsers = queryUsers.where('user.sexo = :sexo', { sexo });
    }
    const users = await queryUsers.getMany();
    if (!users || users.length === 0) {
      throw new BadRequestException('No se encontraron usuarios');
    }
    return users;
  }

  async findAllAutorizar(paginationDto: PaginationDto) {
    const { limit = 5, offset = 0, sexo } = paginationDto;

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

    const users = await queryUsers.getMany();

    if (!users || users.length === 0) {
      throw new BadRequestException('No se encontraron usuarios');
    }

    return users;
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

    return obtenerUsuario;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userReository.findOne({ where: { id } });
    if (!user)
      throw new BadRequestException(
        `No se encontro el usuario con el id:${id}`
      );
    Object.assign(user, updateUserDto);

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
    const user = await this.userReository.findOne({ where: { id } });
    if (!user)
      throw new NotFoundException(
        'No  se encontro el usuario que se desea eliminar'
      );
    await this.userReository.delete(id);
    return 'Usuario Eliminado Exitosamente';
  }

  private handleError(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException(
      'Hubo un error interno en el servidor, por favor revisalo'
    );
  }
}
