import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComentariosTaskService } from './comentarios-task.service';
import { UpdateComentariosTaskDto } from './dto/update-comentarios-task.dto';
import { CreateComentarioDto } from './dto/create-comentarios-task.dto';

@Controller('comentarios-task')
export class ComentariosTaskController {
  constructor(
    private readonly comentariosTaskService: ComentariosTaskService
  ) {}

  @Post()
  create(@Body() createComentariosTaskDto: CreateComentarioDto) {
    return this.comentariosTaskService.create(createComentariosTaskDto);
  }

  @Get()
  findAll() {
    return this.comentariosTaskService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.comentariosTaskService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateComentariosTaskDto: UpdateComentariosTaskDto
  ) {
    return this.comentariosTaskService.update(+id, updateComentariosTaskDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.comentariosTaskService.remove(+id);
  }
}
