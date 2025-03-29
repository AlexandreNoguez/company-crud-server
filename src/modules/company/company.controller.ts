import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ConflictException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { formatError } from 'src/shared/helpers/error.helper';

@ApiTags('Empresas')
@Controller('companies')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova empresa' })
  @ApiResponse({
    status: 201,
    description: 'Empresa criada com sucesso',
    type: Company,
  })
  @ApiBody({ type: CreateCompanyDto })
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    try {
      return await this.companyService.create(createCompanyDto);
    } catch (error) {
      console.log(error);

      throw formatError('Erro interno', error);
    }
  }

  @Get()
  @ApiOperation({ summary: 'Lista todas as empresas' })
  @ApiResponse({
    status: 200,
    description: 'Lista de empresas',
    type: [Company],
  })
  async findAll() {
    return await this.companyService.findAll();
  }

  @ApiOperation({ summary: 'Consulta uma empresa por ID' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Empresa encontrada',
    type: Company,
  })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.companyService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza uma empresa existente' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({
    status: 200,
    description: 'Empresa atualizada com sucesso',
    type: Company,
  })
  @ApiBody({ type: UpdateCompanyDto })
  async update(
    @Param('id') id: string,
    @Body() updateCompanyDto: UpdateCompanyDto,
  ) {
    try {
      return await this.companyService.update(+id, updateCompanyDto);
    } catch (error: unknown) {
      if (isDatabaseError(error) && error.code === '23505') {
        throw new HttpException(
          {
            status: HttpStatus.CONFLICT,
            error: 'CNPJ já cadastrado',
          },
          HttpStatus.CONFLICT,
          { cause: error },
        );
      }

      throw error;
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove uma empresa' })
  @ApiParam({ name: 'id', type: Number })
  @ApiResponse({ status: 200, description: 'Empresa removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Empresa não encontrada' })
  async remove(@Param('id') id: string) {
    return await this.companyService.remove(+id);
  }
}

function isDatabaseError(error: unknown): error is { code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as { code: string }).code === 'string'
  );
}
