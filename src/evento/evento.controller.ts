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
  @Auth(ValidRoles.Administrador)
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
  @Auth(ValidRoles.Administrador)
  remove(@Param('id') id: string) {
    return this.eventoService.remove(id);
  }
}
