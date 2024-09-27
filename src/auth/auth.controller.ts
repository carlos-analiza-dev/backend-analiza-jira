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
  @Auth(ValidRoles.Administrador)
  findAll(@Query() paginationDto: PaginationDto) {
    return this.authService.findAll(paginationDto);
  }

  @Get('active-users')
  @Auth(ValidRoles.Administrador)
  findAllActiveUsers() {
    return this.authService.findAllActiveUsers();
  }

  @Get('users-sucursal')
  @Auth(ValidRoles.Administrador)
  findAllUsersBySucursal() {
    return this.authService.findAllUsersBySucursal();
  }

  @Get('autorizar')
  @Auth(ValidRoles.Administrador)
  findAllUserAutorizados(@Query() paginationDto: PaginationDto) {
    return this.authService.findAllAutorizar(paginationDto);
  }

  @Get('autorizado')
  @Auth(ValidRoles.Administrador)
  findAllAutorizar() {
    return this.authService.findAllUserAutorizados();
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
