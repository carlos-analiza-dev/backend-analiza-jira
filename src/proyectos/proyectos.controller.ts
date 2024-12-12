import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProyectosService } from './proyectos.service';
import { CreateProyectoDto } from './dto/create-proyecto.dto';
import { UpdateProyectoDto } from './dto/update-proyecto.dto';
import { User } from 'src/auth/entities/user.entity';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles';
import { PaginationDto } from 'src/common/dto/pagination.dto';
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

  @Get('/mis-proyectos-responsable')
  @Auth()
  findAllProyectosResponsable(@GetUser() user: User) {
    return this.proyectosService.findAllProyectosResponsable(user);
  }

  @Get('/accept')
  @Auth()
  findAceptProyectos(@GetUser() user: User) {
    return this.proyectosService.findAceptProyectos();
  }

  @Get('/rechazados')
  @Auth()
  findRejectedProyectos(@Query() paginationDto:PaginationDto,@GetUser() user: User) {
    return this.proyectosService.findRejectedProyectos(paginationDto,user);
  }

  @Get('status/:responsableId')
  async getProyectosPorStatus(
    @Param('responsableId', ParseUUIDPipe) responsableId: string
  ) {
    return this.proyectosService.getProyectosPorStatus(responsableId);
  }

  @Get()
  @Auth()
  findAll(@GetUser() user: User) {
    return this.proyectosService.findAll(user);
  }

  @Get('manager')
  @Auth(ValidRoles.Manager)
  findProyectosManager(@Query() paginationDto: PaginationDto) {
    return this.proyectosService.findProyectosManager(paginationDto);
  }

  @Get('status')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAllStatusProyectos() {
    return this.proyectosService.findAllStatusProyectos();
  }

  @Get(':id/colaborador')
  @Auth()
  getColaboradoresByProjectId(
    @Param('id', ParseUUIDPipe) proyectoId: string,
    @GetUser() user: User
  ) {
    return this.proyectosService.getColaboradoresByProjectId(proyectoId, user);
  }

  @Get(':id/colaboradorByProject')
  @Auth()
  getColaboradoresProjectId(
    @Param('id', ParseUUIDPipe) proyectoId: string,
    @GetUser() user: User
  ) {
    return this.proyectosService.getColaboradoresProjectId(proyectoId, user);
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
