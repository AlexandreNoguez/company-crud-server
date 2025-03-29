import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { EmailService } from '../../shared/email/email.service';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  COMPANY_CREATED_TEMPLATE,
  COMPANY_UPDATED_TEMPLATE,
  COMPANY_UPDATED_TITLE,
  NEW_COMPANY_CREATED_TITLE,
} from '../../constants/email-templates';

@Injectable()
export class CompanyService {
  constructor(
    private readonly emailService: EmailService,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
  ) {}

  async create(createCompanyDto: CreateCompanyDto): Promise<Company> {
    const company = this.companyRepository.create(createCompanyDto);
    const saved = await this.companyRepository.save(company);

    await this.emailService.sendCompanyNotification(
      {
        nome: saved.name,
        nomeFantasia: saved.tradeName,
        cnpj: saved.cnpj,
        endereco: saved.address,
        destinatario: process.env.NOTIFY_EMAILS!,
      },
      COMPANY_CREATED_TEMPLATE,
      NEW_COMPANY_CREATED_TITLE,
    );

    return saved;
  }

  findAll() {
    return this.companyRepository.find();
  }

  findOne(id: number) {
    return this.companyRepository.findOne({
      where: { id },
    });
  }

  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company> {
    const company = await this.companyRepository.preload({
      id,
      ...updateCompanyDto,
    });

    if (!company) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    const updated = await this.companyRepository.save(company);

    await this.emailService.sendCompanyNotification(
      {
        nome: updated.name,
        nomeFantasia: updated.tradeName,
        cnpj: updated.cnpj,
        endereco: updated.address,
        destinatario: process.env.NOTIFY_EMAILS!,
      },
      COMPANY_UPDATED_TEMPLATE,
      COMPANY_UPDATED_TITLE,
    );

    return updated;
  }

  async remove(id: number) {
    const result = await this.companyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }
    return result;
  }
}
