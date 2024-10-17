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
import { ActividadesService } from './actividades.service';
import { CreateActividadeDto } from './dto/create-actividade.dto';
import { UpdateActividadeDto } from './dto/update-actividade.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { GetUser } from 'src/auth/decorators/get-user.decorator';
import { User } from 'src/auth/entities/user.entity';

@Controller('actividades')
export class ActividadesController {
  constructor(private readonly actividadesService: ActividadesService) {}

  @Post()
  @Auth()
  create(
    @Body() createActividadeDto: CreateActividadeDto,
    @GetUser() user: User
  ) {
    return this.actividadesService.create(createActividadeDto, user);
  }

  @Get()
  findAll() {
    return this.actividadesService.findAll();
  }

  @Get(':id')
  @Auth()
  findAllByEventoId(@Param('id', ParseUUIDPipe) id: string) {
    return this.actividadesService.findAllByEventoId(id);
  }

  /*  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actividadesService.findOne(id);
  } */

  @Patch(':id')
  @Auth()
  update(
    @Param('id') id: string,
    @Body() updateActividadeDto: UpdateActividadeDto,
    @GetUser() user: User
  ) {
    return this.actividadesService.update(id, updateActividadeDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actividadesService.remove(id);
  }
}
