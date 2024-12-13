import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ProyectosRechazadosService } from './proyectos-rechazados.service';
import { CreateProyectosRechazadoDto } from './dto/create-proyectos-rechazado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('proyectos-rechazados')
export class ProyectosRechazadosController {
  constructor(
    private readonly proyectosRechazadosService: ProyectosRechazadosService
  ) {}

  @Post('rechazar')
  create(@Body() createProyectosRechazadoDto: CreateProyectosRechazadoDto) {
    return this.proyectosRechazadosService.create(createProyectosRechazadoDto);
  }

  @Get()
  findAll() {
    return this.proyectosRechazadosService.findAll();
  }

  @Get('rechazados/:userId')
  findOne(
    @Query() paginationDto: PaginationDto,
    @Param('userId') userId: string
  ) {
    return this.proyectosRechazadosService.getProyectosRechazados(
      paginationDto,
      userId
    );
  }
}
