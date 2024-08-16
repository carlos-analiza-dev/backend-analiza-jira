import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolRepository: Repository<Role>
  ) {}
  async create(createRoleDto: CreateRoleDto) {
    try {
      const rol = this.rolRepository.create(createRoleDto);
      await this.rolRepository.save(rol);
      return rol;
    } catch (error) {
      this.handleError(error);
    }
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: string) {
    return `This action returns a #${id} role`;
  }

  update(id: string, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: string) {
    return `This action removes a #${id} role`;
  }
  private handleError(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    throw new InternalServerErrorException(
      'Hubo un error interno en el servidor, revisalo'
    );
  }
}
