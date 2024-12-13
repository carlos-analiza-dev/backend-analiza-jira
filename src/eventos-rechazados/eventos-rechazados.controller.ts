import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { EventosRechazadosService } from './eventos-rechazados.service';
import { CreateEventosRechazadoDto } from './dto/create-eventos-rechazado.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('eventos-rechazados')
export class EventosRechazadosController {
  constructor(
    private readonly eventosRechazadosService: EventosRechazadosService
  ) {}

  @Post('rechazar')
  create(@Body() createEventosRechazadoDto: CreateEventosRechazadoDto) {
    return this.eventosRechazadosService.create(createEventosRechazadoDto);
  }

  @Get('rechazados/:userId')
  findOne(
    @Query() paginationDto: PaginationDto,
    @Param('userId') userId: string
  ) {
    return this.eventosRechazadosService.getEventosRechazados(
      paginationDto,
      userId
    );
  }
}
