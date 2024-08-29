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
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SendMailDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from './decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { RoleProtected } from './decorators/role-protected/role-protected.decorator';
import { ValidRoles } from 'src/interfaces/valid-roles';
import { Auth } from './decorators/auth.decorator';

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
  findAll(@Query() paginationDto: PaginationDto) {
    return this.authService.findAll(paginationDto);
  }

  @Get('autorizar')
  findAllAutorizar(@Query() paginationDto: PaginationDto) {
    return this.authService.findAllAutorizar(paginationDto);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  testingPrivateRoute(
    /* @Req() request: Express.Request */ @GetUser() user: User
  ) {
    return { messsage: 'Desde Testing', user };
  }

  @Get('private2')
  @RoleProtected(ValidRoles.gerente)
  @UseGuards(AuthGuard(), UserRoleGuard)
  testingPrivateRoute2(@GetUser() user: User) {
    return { messsage: 'Desde Testing', user };
  }

  @Get('private3')
  @Auth(ValidRoles.Administrador)
  testingPrivateRoute3(@GetUser() user: User) {
    return { messsage: 'Desde Testing', user };
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
