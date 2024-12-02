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
import { TareasService } from './tareas.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('tareas')
export class TareasController {
  constructor(private readonly tareasService: TareasService) {}

  @Post()
  @Auth()
  create(@Body() createTareaDto: CreateTareaDto, @GetUser() user: User) {
    return this.tareasService.create(createTareaDto, user);
  }

  @Get()
  @Auth()
  findAll() {
    return this.tareasService.findAll();
  }

  @Get(':id')
  @Auth()
  findAllTareasByProyectoId(@Param('id', ParseUUIDPipe) id: string) {
    return this.tareasService.findAllTareasByProyectoId(id);
  }

  @Get('tarea/:tareaId')
  @Auth()
  findAllTareaId(@Param('tareaId', ParseUUIDPipe) tareaId: string) {
    return this.tareasService.findAllTareaId(tareaId);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTareaDto: UpdateTareaDto,
    @GetUser() user: User
  ) {
    return this.tareasService.update(id, updateTareaDto, user);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.tareasService.remove(id);
  }
}
