import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { RolesModule } from './roles/roles.module';
import { SucursalModule } from './sucursal/sucursal.module';
import { ProyectosModule } from './proyectos/proyectos.module';
import { TareasModule } from './tareas/tareas.module';
import { MailModule } from './mail/mail.module';
import { EventoModule } from './evento/evento.module';
import { ActividadesModule } from './actividades/actividades.module';
import { EmpresaModule } from './empresa/empresa.module';
import { ComentariosTaskModule } from './comentarios-task/comentarios-task.module';
import { ComentariosActividadModule } from './comentarios-actividad/comentarios-actividad.module';
import { ProyectosRechazadosModule } from './proyectos-rechazados/proyectos-rechazados.module';
import { EventosRechazadosModule } from './eventos-rechazados/eventos-rechazados.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: +process.env.BD_PORT,
      database: process.env.DB_NAME,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule,
    CommonModule,
    RolesModule,
    SucursalModule,
    ProyectosModule,
    TareasModule,
    MailModule,
    EventoModule,
    ActividadesModule,
    EmpresaModule,
    ComentariosTaskModule,
    ComentariosActividadModule,
    ProyectosRechazadosModule,
    EventosRechazadosModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
