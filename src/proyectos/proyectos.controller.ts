import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ProyectosService } from './proyectos.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles';
import { ColaboradorDTO } from './dto/colaborador.dto';

@Controller('proyectos')
export class ProyectosController {
  constructor(private readonly proyectosService: ProyectosService) {}

  @Post()
  @Auth()
  create(@Body() createProyectoDto: CreateProyectoDto, @GetUser() user: User) {
    return this.proyectosService.create(createProyectoDto, user);
  }

  @Post(':id/colaborador')
  @Auth()
  addColaborador(
    @Param('id', ParseUUIDPipe) proyectoId: string,
    @Body('userId', ParseUUIDPipe) userId: string,
    @GetUser() user: User
  ) {
    return this.proyectosService.addColaborador(proyectoId, userId, user);
  }

  @Get('/mis-proyectos')
  @Auth()
  findAllProyectos(@GetUser() user: User) {
    return this.proyectosService.findAllProyectos(user);
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.proyectosService.findAll(user);
  }

  @Get(':id/colaborador')
  @Auth()
  getColaboradoresByProjectId(
    @Param('id', ParseUUIDPipe) proyectoId: string,
    @GetUser() user: User
  ) {
    return this.proyectosService.getColaboradoresByProjectId(proyectoId, user);
  }

  @Get(':id')
  @Auth()
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.proyectosService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProyectoDto: UpdateProyectoDto
  ) {
    return this.proyectosService.update(id, updateProyectoDto);
  }

  @Delete(':proyectoId/:userId/colaborador')
  @Auth()
  deleteColaborador(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    user: User
  ) {
    return this.proyectosService.deleteColaborador(proyectoId, userId, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.proyectosService.remove(id);
  }
}
