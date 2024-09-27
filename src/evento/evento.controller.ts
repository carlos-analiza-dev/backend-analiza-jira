import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { EventoService } from './evento.service';
import { CreateEventoDto } from './dto/create-evento.dto';
import { UpdateEventoDto } from './dto/update-evento.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('evento')
export class EventoController {
  constructor(private readonly eventoService: EventoService) {}

  @Post()
  @Auth(ValidRoles.Administrador)
  create(@Body() createEventoDto: CreateEventoDto, @GetUser() user: User) {
    return this.eventoService.create(createEventoDto, user);
  }

  @Get()
  @Auth(ValidRoles.Administrador)
  findAllByAdmin(@GetUser() user: User) {
    return this.eventoService.findAllByAdmin(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.eventoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEventoDto: UpdateEventoDto) {
    return this.eventoService.update(+id, updateEventoDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id') id: string) {
    return this.eventoService.remove(id);
  }
}
