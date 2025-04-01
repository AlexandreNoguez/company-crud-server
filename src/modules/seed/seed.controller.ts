import { Controller, Post } from '@nestjs/common';
import { CompanyService } from '../company/company.service';

@Controller('seed')
export class SeedController {
  constructor(private readonly companyService: CompanyService) {}

  @Post('companies')
  async seedCompanies() {
    const empresas = Array.from({ length: 20 }, (_, i) => ({
      name: `Company ${i + 1}`,
      tradeName: `Company Fantasy ${i + 1}`,
      cnpj: `98.722.${i.toString().padStart(3, '0')}/0001-${i
        .toString()
        .padStart(2, '0')}`,
      address:
        'Rua Reverendo Olavo Nunes, 280 - BL5 APTO 501, Parque Santa Fé, Porto Alegre - RS, CEP: 91180-370',
    }));


    for (const empresa of empresas) {
      await this.companyService.create(empresa);
    }

    return { message: 'Seed criada com sucesso!' };
  }
}
