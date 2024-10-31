import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { SucursalService } from './sucursal.service';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Controller('sucursal')
export class SucursalController {
  constructor(private readonly sucursalService: SucursalService) {}

  @Post()
  @Auth(ValidRoles.Administrador)
  create(@Body() createSucursalDto: CreateSucursalDto) {
    return this.sucursalService.create(createSucursalDto);
  }

  @Get()
  @Auth(ValidRoles.Administrador)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.sucursalService.findAll(paginationDto);
  }

  @Get('sucursales')
  findAllSucursales(@Query() paginationDto: PaginationDto) {
    return this.sucursalService.findAllSucursales(paginationDto);
  }

  @Get(':id')
  @Auth(ValidRoles.Administrador)
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sucursalService.findOne(id);
  }

  @Patch(':id')
  @Auth(ValidRoles.Administrador)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSucursalDto: UpdateSucursalDto
  ) {
    return this.sucursalService.update(id, updateSucursalDto);
  }

  @Delete(':id')
  @Auth(ValidRoles.Administrador)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sucursalService.remove(id);
  }
}
