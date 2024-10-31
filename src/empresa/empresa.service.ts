import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateEmpresaDto } from './dto/create-empresa.dto';
import { UpdateEmpresaDto } from './dto/update-empresa.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Empresa } from './entities/empresa.entity';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@Injectable()
export class EmpresaService {
  constructor(
    @InjectRepository(Empresa)
    private readonly empresaRepository: Repository<Empresa>
  ) {}
  async create(createEmpresaDto: CreateEmpresaDto) {
    const { nombre, descripcion } = createEmpresaDto;
    try {
      const empresaCreada = this.empresaRepository.create({
        nombre,
        descripcion,
      });
      if (!empresaCreada)
        throw new BadRequestException(
          'Ocurrio un error al momento de crear la empresa.'
        );
      await this.empresaRepository.save(empresaCreada);
      return 'empresa creada con exito';
    } catch (error) {
      throw error;
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, offset } = paginationDto;

    try {
      const [empresas, total] = await this.empresaRepository.findAndCount({
        take: limit, // Límite de resultados por página
        skip: offset, // Número de resultados a saltar
        order: { nombre: 'ASC' }, // Opcional: ordenar alfabéticamente por nombre
      });

      if (!empresas || empresas.length === 0) {
        throw new NotFoundException('No se encontraron empresas disponibles');
      }

      return {
        total,
        empresas,
      };
    } catch (error) {
      throw error;
    }
  }

  async findAllEmpresas() {
    const empresas = await this.empresaRepository.find({});
    try {
      if (!empresas || empresas.length === 0) {
        throw new NotFoundException('No se encontraron empresas disponibles');
      }
      return empresas;
    } catch (error) {
      throw empresas;
    }
  }

  async findOne(id: string) {
    const empresaId = await this.empresaRepository.findOne({ where: { id } });
    try {
      if (!empresaId) throw new NotFoundException('No se encontro la empresa');
      return empresaId;
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, updateEmpresaDto: UpdateEmpresaDto) {
    try {
      const empresaExistente = await this.findOne(id);
      const empresaActualizada = Object.assign(
        empresaExistente,
        updateEmpresaDto
      );

      await this.empresaRepository.save(empresaActualizada);
      return 'Empresa actualizada con éxito';
    } catch (error) {
      throw error;
    }
  }

  async remove(id: string) {
    const empresaEliminar = await this.findOne(id);
    await this.empresaRepository.remove(empresaEliminar);
    return 'Empresa eliminada exitosamente';
  }
}
