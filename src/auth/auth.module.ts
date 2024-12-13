import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { Sucursal } from 'src/sucursal/entities/sucursal.entity';
import { Role } from 'src/roles/entities/role.entity';
import { Tarea } from 'src/tareas/entities/tarea.entity';
import { Proyecto } from 'src/proyectos/entities/proyecto.entity';
import { MailService } from 'src/mail/mail.service';
import { Actividade } from 'src/actividades/entities/actividade.entity';
import { Evento } from 'src/evento/entities/evento.entity';
import { ProyectosRechazado } from 'src/proyectos-rechazados/entities/proyectos-rechazado.entity';
import { EventosRechazado } from 'src/eventos-rechazados/entities/eventos-rechazado.entity';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, MailService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      User,
      Sucursal,
      Role,
      Tarea,
      Proyecto,
      Actividade,
      Evento,
      ProyectosRechazado,
      EventosRechazado,
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
          signOptions: {
            expiresIn: '12h',
          },
        };
      },
    }),
  ],
  exports: [TypeOrmModule, JwtStrategy, PassportModule, JwtModule],
})
export class AuthModule {}
