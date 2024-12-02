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
  BadRequestException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SendMailDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ValidRoles } from 'src/interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';
import { CorreoDto } from './dto/correo-user.dto';
import { User } from './entities/user.entity';
import { GetUser } from './decorators/get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.authService.create(createUserDto);
  }

  @Post('login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Post('sendmail')
  sendMail(@Body() sendMailDto: SendMailDto) {
    return this.authService.sendMail(sendMailDto.correo);
  }

  @Post('actualizar-password')
  actualizarContrasena(@Body() updatePassword: UpdatePasswordDto) {
    return this.authService.actualizarContrasena(updatePassword);
  }

  @Get('users')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAll(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.authService.findAll(paginationDto, user);
  }

  @Get('Allusers')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAllUsers(@Query() paginationDto: PaginationDto, @GetUser() user: User) {
    return this.authService.findAllUsers(paginationDto, user);
  }

  @Get('usersActives')
  @Auth()
  findAllUsersActive(@GetUser() user: User) {
    return this.authService.findAllUsersActive(user);
  }

  @Get('users-empresa')
  @Auth()
  findAllUsersEmpresa() {
    return this.authService.findAllUsersEmpresa();
  }

  @Get('users-rol')
  @Auth()
  findAllUsersRol(@Query('pais') pais?: string) {
    return this.authService.findAllUsersRol(pais);
  }

  @Get('usersByEventos')
  @Auth()
  findAllUsersByEventos(@Query() paginationDto: PaginationDto) {
    return this.authService.findAllUsersByEventos(paginationDto);
  }

  @Get('usersByEmail')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAllByEmail(@Query() sendMailDto: SendMailDto) {
    return this.authService.findByEmail(sendMailDto);
  }

  @Get('usersByRol')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAllByRol(@Query() paginationDto: PaginationDto) {
    return this.authService.findAllByRol(paginationDto);
  }

  @Get('usersByProjectRole/:proyectoId')
  @Auth()
  async getUsersByProjectRole(
    @Param('proyectoId', ParseUUIDPipe) proyectoId: string,
    @Query() paginationDto: PaginationDto
  ) {
    return this.authService.findUsersByProjectRole(paginationDto, proyectoId);
  }

  @Get('active-users')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAllActiveUsers(@Query() paginationDto: PaginationDto) {
    return this.authService.findAllActiveUsers(paginationDto);
  }

  @Get('users-sucursal')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAllUsersBySucursal(@Query() paginatioDto: PaginationDto) {
    return this.authService.findAllUsersBySucursal(paginatioDto);
  }

  @Get('autorizar')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAllUserAutorizados(@Query() paginationDto: PaginationDto) {
    return this.authService.findAllAutorizar(paginationDto);
  }

  @Get('autorizado')
  @Auth(ValidRoles.Administrador, ValidRoles.Manager)
  findAllAutorizar(@Query() paginationDto: PaginationDto) {
    return this.authService.findAllUserAutorizados(paginationDto);
  }

  @Post('colaborador')
  @Auth()
  findOneByEmail(@Body() correoDto: CorreoDto, @GetUser() user: User) {
    return this.authService.obtenerUserByEmail(correoDto, user);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.findOne(id);
  }

  @Patch(':id')
  @Auth()
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto
  ) {
    return this.authService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.authService.remove(id);
  }
}
