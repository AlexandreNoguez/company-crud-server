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
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto) {
    try {
      return await this.companyService.create(createCompanyDto);
    } catch (error) {
      console.error(error);

      if (error?.code === '23505') {
        // Erro de CNPJ duplicado (unique constraint)
        throw new ConflictException('CNPJ já cadastrado');
      }

      throw new InternalServerErrorException('Erro ao criar empresa');
    }
  }

  @Get()
  async findAll() {
    return await this.companyService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.companyService.findOne(+id);
  }

  @Patch(':id')
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
