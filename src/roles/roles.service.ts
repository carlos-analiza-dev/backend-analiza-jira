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

  async findAll() {
    try {
      const roles = await this.rolRepository.find({});
      if (!roles || roles.length === 0) {
        throw new BadRequestException('No se encontraron roles disponibles');
      }
      return roles;
    } catch (error) {
      this.handleError(error);
    }
  }

  async findOne(id: string) {
    try {
      const rol = this.rolRepository.findOne({ where: { id } });
      if (!rol)
        throw new BadRequestException(
          `No se pudo encontrar el rol con el id:${id}`
        );
      return rol;
    } catch (error) {
      this.handleError(error);
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const usuarioUpdate = await this.rolRepository.findOne({ where: { id } });
    if (!usuarioUpdate)
      throw new BadRequestException(
        'El usuario que deseas actualizar no existe en la base de datos'
      );
    try {
      await this.rolRepository.update(id, updateRoleDto);
      return `Usuario con id:${id} actualizado exitosamente`;
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const usuarioDelete = await this.rolRepository.findOne({ where: { id } });
    if (!usuarioDelete)
      throw new BadRequestException(
        'El usuario que intentas eliminar no se encuentra en la base de datos'
      );
    await this.rolRepository.delete(id);
    return `Usuario Eliminado exitosamente`;
  }
  private handleError(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);
    throw new InternalServerErrorException(
      'Hubo un error interno en el servidor, revisalo'
    );
  }
}
