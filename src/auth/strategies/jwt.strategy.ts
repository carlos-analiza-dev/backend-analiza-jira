import { ConfigService } from '@nestjs/config';
import { User } from './../entities/user.entity';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JwtPayload } from 'src/interfaces/jwt-payload.interface';
import { Repository } from 'typeorm';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    configService: ConfigService
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }
  async validate(payload: JwtPayload): Promise<User> {
    const { id } = payload;
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new UnauthorizedException('Token invalido');
    if (!user.isActive)
      throw new UnauthorizedException(
        'El usuario no esta activo, contactese con el administrador'
      );
    if (user.autorizado === 0)
      throw new UnauthorizedException(
        'No ha sido autorizado, contactese con el administrador'
      );

    return user;
  }
}
