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

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userReository: Repository<User>,
    private readonly jwtService: JwtService
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { nombre, correo, dni, direccion, edad, password, sexo } =
        createUserDto;
      const passwordHash = bcrypt.hashSync(password, 10);
      const user = this.userReository.create({
        nombre: nombre,
        correo: correo,
        dni: dni,
        direccion: direccion,
        edad: edad,
        password: passwordHash,
        sexo: sexo,
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

      return { ...user, token: this.getJwtPayload({ id: user.id }) };
    } catch (error) {
      this.handleError(error);
    }
  }

  private getJwtPayload(payload: JwtPayload) {
    const token = this.jwtService.sign(payload);
    return token;
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 9, offset = 0, sexo } = paginationDto;
    let queryUsers = this.userReository
      .createQueryBuilder('user')
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

  async updateUser(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.userReository.findOne({ where: { id } });
    if (!user)
      throw new BadRequestException(
        `No se encontro el usuario con el id:${id}`
      );
    Object.assign(user, updateUserDto);

    return this.userReository.save(user);
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private handleError(error: any): never {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    console.log(error);

    throw new InternalServerErrorException(
      'Hubo un error interno en el servidor, por favor revisalo'
    );
  }
}
