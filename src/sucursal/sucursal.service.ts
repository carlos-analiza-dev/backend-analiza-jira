import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateSucursalDto } from './dto/create-sucursal.dto';
import { UpdateSucursalDto } from './dto/update-sucursal.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sucursal } from './entities/sucursal.entity';

@Injectable()
export class SucursalService {
  constructor(
    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>
  ) {}
  async create(createSucursalDto: CreateSucursalDto) {
    try {
      const sucursal = this.sucursalRepository.create(createSucursalDto);
      await this.sucursalRepository.save(sucursal);
      return sucursal;
    } catch (error) {
      console.log(error);
      this.handleError(error);
    }
  }

  async findAll() {
    const allSucursals = await this.sucursalRepository.find({});
    if (!allSucursals || allSucursals.length === 0)
      throw new NotFoundException(
        'No se encontraron sucursales en la base de datos'
      );

    return allSucursals;
  }

  async findOne(id: string) {
    const sucurcalById = await this.sucursalRepository.findOne({
      where: { id },
    });
    if (!sucurcalById)
      throw new NotFoundException('No se pudo encontrar la sucursal');
    return sucurcalById;
  }

  async update(id: string, updateSucursalDto: UpdateSucursalDto) {
    const updateSucursal = await this.sucursalRepository.find({
      where: { id },
    });
    if (!updateSucursal)
      throw new NotFoundException(
        `No se encontro la sucursale con el id:${id}`
      );
    try {
      await this.sucursalRepository.update(id, updateSucursalDto);
      return 'Sucursal actualizada exitosamente';
    } catch (error) {
      this.handleError(error);
    }
  }

  async remove(id: string) {
    const deleteSucursal = await this.sucursalRepository.findOne({
      where: { id },
    });
    if (!deleteSucursal)
      throw new NotFoundException(
        'No se encontro la sucursal que se desea eliminar'
      );
    await this.sucursalRepository.delete(id);
    return 'Sucursal eliminida exitosamente';
  }

  private handleError(error: any) {
    if (error.code === '23505') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException(
      'Hubo un error intrerno en el servidor'
    );
  }
}
