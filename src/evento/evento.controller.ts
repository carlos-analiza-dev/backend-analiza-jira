import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('evento')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Post()
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  create(@Body() createEventoDto: CreateEventoDto, @GetUser() user: User) {
    return this.eventoService.create(createEventoDto, user);
  }

  @Post(':id/colaborador')
  @Auth()
  addColaborador(
    @Param('id', ParseUUIDPipe) eventoId: string,
    @Body('userId', ParseUUIDPipe) userId: string,
    @GetUser() user: User
  ) {
    return this.eventoService.addColaborador(eventoId, userId, user);
  }

  @Get()
  @Auth()
  findAllByAdmin(@GetUser() user: User) {
    return this.eventoService.findAllByAdmin(user);
  }

  @Get('/mis-eventos-responsable')
  @Auth()
  findAllEventosResponsable(@GetUser() user: User) {
    return this.eventoService.findAllEventosResponsable(user);
  }

  @Get('/status-eventos')
  @Auth()
  findAllStatusEventos() {
    return this.eventoService.findAllStatusEventos();
  }

  @Get('status/:responsableId')
  async getEventosPorStatus(
    @Param('responsableId', ParseUUIDPipe) responsableId: string
  ) {
    return this.eventoService.getEventosPorStatus(responsableId);
  }

  @Get('manager')
  @Auth(ValidRoles.Manager)
  findAllEventosManager(@Query() paginationDto: PaginationDto) {
    return this.eventoService.findAllEventosManager(paginationDto);
  }

  @Get('eventos-rechazados')
  @Auth()
  findRejectedEventos(
    @Query() paginationDto: PaginationDto,
    @GetUser() user: User
  ) {
    return this.eventoService.findRejectedEventos(paginationDto, user);
  }
  @Get('finalizados/:userId')
  async getFinalizedEventCountByUser(@Param('userId') userId: string) {
    return this.eventoService.countFinalizedEventsByUser(userId);
  }

  @Get(':id/colaborador')
  @Auth()
  getColaboradoresByProjectId(
    @Param('id', ParseUUIDPipe) eventoId: string,
    @GetUser() user: User
  ) {
    return this.eventoService.getColaboradoresByEventoId(eventoId, user);
  }

  @Get(':id/colaboradores')
  @Auth()
  getUsersByEventoId(
    @Param('id', ParseUUIDPipe) eventoId: string,
    @GetUser() user: User
  ) {
    return this.eventoService.getUsersByEventoId(eventoId, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventoService.update(id, updateEventoDto);
  }

  @Delete(':eventoId/:userId/colaborador')
  @Auth()
  deleteColaborador(
    @Param('eventoId', ParseUUIDPipe) eventoId: string,
    @Param('userId', ParseUUIDPipe) userId: string,
    user: User
  ) {
    return this.eventoService.deleteColaborador(eventoId, userId, user);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  remove(@Param('id') id: string) {
    return this.eventoService.remove(id);
  }
}
