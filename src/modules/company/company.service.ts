import { Repository } from 'typeorm';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { EmailService } from '../../shared/email/email.service';
import { Company } from './entities/company.entity';
import { handleDatabaseError } from '../../shared/helpers/handle-database-error';
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

  /**
   * Cria uma nova empresa e envia uma notificação por e-mail.
   * @param createCompanyDto - Dados para criação da empresa
   * @returns Empresa criada
   */
  async create(createCompanyDto: CreateCompanyDto): Promise<Company | null> {
    try {
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
    } catch (error) {
      handleDatabaseError(error, 'Erro ao criar a empresa.');
      return null;
    }
  }

  /**
   * Lista todas as empresas cadastradas.
   * @returns Lista de empresas
   */
  findAll() {
    return this.companyRepository.find();
  }

  /**
   * Retrieves a company by its unique identifier.
   *
   * @param id - The unique identifier of the company to retrieve.
   * @returns The company entity if found.
   * @throws NotFoundException - If no company is found with the given identifier.
   */
  async findOne(id: number) {
    const company = await this.companyRepository.findOne({
      where: { id },
    });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    return company;
  }

  /**
   * Atualiza os dados de uma empresa existente e envia uma notificação.
   * @param id - ID da empresa
   * @param updateCompanyDto - Novos dados da empresa
   * @returns Empresa atualizada
   */
  async update(
    id: number,
    updateCompanyDto: UpdateCompanyDto,
  ): Promise<Company | null> {
    try {
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
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      handleDatabaseError(error, 'Erro ao atualizar a empresa.');
      return null; // Retorna null em caso de erro
    }
  }

  /**
   * Soft deletes a company by its ID.
   *
   * This method retrieves a company entity by its ID and performs a soft delete operation,
   * which marks the entity as deleted without permanently removing it from the database.
   *
   * @param id - The unique identifier of the company to be soft deleted.
   * @throws NotFoundException - If no company is found with the provided ID.
   * @returns A promise that resolves when the soft delete operation is complete.
   */
  async softRemove(id: number): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { id } });

    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }

    await this.companyRepository.softRemove(company);
  }

  /**
   * Remove uma empresa pelo ID.
   * @param id - ID da empresa
   * @returns Resultado da operação de remoção
   */
  async remove(id: number) {
    const result = await this.companyRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }
    return result;
  }
}
