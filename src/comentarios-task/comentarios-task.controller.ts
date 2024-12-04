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
import { ComentariosTaskService } from './comentarios-task.service';
import { UpdateComentariosTaskDto } from './dto/update-comentarios-task.dto';
import { CreateComentarioDto } from './dto/create-comentarios-task.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('comentarios-task')
export class ComentariosTaskController {
  constructor(
    private readonly comentariosTaskService: ComentariosTaskService
  ) {}

  @Post(':tareaId')
  @Auth()
  create(
    @Param('tareaId', ParseUUIDPipe) tareaId: string,
    @Body() createComentariosTaskDto: CreateComentarioDto
  ) {
    return this.comentariosTaskService.create(
      tareaId,
      createComentariosTaskDto
    );
  }

  @Get(':tareaId')
  @Auth()
  findAll(@Param('tareaId', ParseUUIDPipe) tareaId: string) {
    return this.comentariosTaskService.findAll(tareaId);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateComentariosTaskDto: UpdateComentariosTaskDto
  ) {
    return this.comentariosTaskService.update(id, updateComentariosTaskDto);
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.comentariosTaskService.remove(id);
  }
}
