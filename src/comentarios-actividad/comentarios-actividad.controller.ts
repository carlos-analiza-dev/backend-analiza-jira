import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Get,
} from '@nestjs/common';
import { ComentariosActividadService } from './comentarios-actividad.service';
import { CreateComentarioDto } from './dto/create-comentarios-actividad.dto';
import { UpdateComentariosActividadDto } from './dto/update-comentarios-actividad.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';

@Controller('comentarios-actividad')
export class ComentariosActividadController {
  constructor(
    private readonly comentariosActividadService: ComentariosActividadService
  ) {}

  @Post(':actividadId')
  @Auth()
  create(
    @Param('actividadId', ParseUUIDPipe) actividadId: string,
    @Body() createComentariosActividadDto: CreateComentarioDto
  ) {
    return this.comentariosActividadService.create(
      actividadId,
      createComentariosActividadDto
    );
  }

  @Get(':actividadId')
  @Auth()
  findAll(@Param('actividadId', ParseUUIDPipe) actividadId: string) {
    return this.comentariosActividadService.findAll(actividadId);
  }

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateComentariosActividadDto: UpdateComentariosActividadDto
  ) {
    return this.comentariosActividadService.update(
      id,
      updateComentariosActividadDto
    );
  }

  @Delete(':id')
  @Auth()
  remove(@Param('id') id: string) {
    return this.comentariosActividadService.remove(id);
  }
}
