import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { CompanyService } from './company.service';
import { EmailService } from '../../shared/email/email.service';
import {
  COMPANY_CREATED_TEMPLATE,
  COMPANY_UPDATED_TEMPLATE,
  COMPANY_UPDATED_TITLE,
  NEW_COMPANY_CREATED_TITLE,
} from '../../constants/email-templates';

const mockCompanyRepository = {
  create: jest.fn(),
  save: jest.fn(),
  preload: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  delete: jest.fn(),
  findAndCount: jest.fn(),
  softRemove: jest.fn(),
};

const mockEmailService = {
  sendCompanyNotification: jest.fn(),
};

describe('CompanyService', () => {
  let service: CompanyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompanyService,
        {
          provide: getRepositoryToken(Company),
          useValue: mockCompanyRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
      ],
    }).compile();

    service = module.get<CompanyService>(CompanyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a company and send email', async () => {
    const dto = {
      name: 'Empresa X',
      tradeName: 'XPTO',
      cnpj: '123456789',
      address: 'Rua A',
    };

    const savedCompany = { id: 1, ...dto };

    mockCompanyRepository.create.mockReturnValue(dto);
    mockCompanyRepository.save.mockResolvedValue(savedCompany);

    const result = await service.create(dto);

    expect(mockCompanyRepository.create).toHaveBeenCalledWith(dto);
    expect(mockCompanyRepository.save).toHaveBeenCalledWith(dto);
    expect(mockEmailService.sendCompanyNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: dto.name,
        cnpj: dto.cnpj,
        nomeFantasia: dto.tradeName,
        endereco: dto.address,
      }),
      COMPANY_CREATED_TEMPLATE,
      NEW_COMPANY_CREATED_TITLE,
    );
    expect(result).toEqual(savedCompany);
  });

  it('should update a company and send email', async () => {
    const dto = {
      name: 'Empresa Atualizada',
      tradeName: 'Atual LTDA',
      cnpj: '987654321',
      address: 'Rua B',
    };

    const updatedCompany = { id: 1, ...dto };

    mockCompanyRepository.preload.mockResolvedValue(updatedCompany);
    mockCompanyRepository.save.mockResolvedValue(updatedCompany);

    const result = await service.update(1, dto);

    expect(mockCompanyRepository.preload).toHaveBeenCalledWith({
      id: 1,
      ...dto,
    });
    expect(mockCompanyRepository.save).toHaveBeenCalledWith(updatedCompany);
    expect(mockEmailService.sendCompanyNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        nome: dto.name,
        cnpj: dto.cnpj,
        nomeFantasia: dto.tradeName,
        endereco: dto.address,
      }),
      COMPANY_UPDATED_TEMPLATE,
      COMPANY_UPDATED_TITLE,
    );
    expect(result).toEqual(updatedCompany);
  });

  it('should throw if company not found on update', async () => {
    mockCompanyRepository.preload.mockResolvedValue(null);

    await expect(service.update(1, {})).rejects.toThrow(NotFoundException);
  });

  it('should return all companies', async () => {
    const companies = [{ id: 1 }, { id: 2 }];
    const total = 2;

    mockCompanyRepository.findAndCount.mockResolvedValue([companies, total]);

    const result = await service.findAll(1, 10);

    expect(mockCompanyRepository.findAndCount).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
      order: { id: 'ASC' },
    });

    expect(result).toEqual({
      data: companies,
      total,
      page: 1,
      lastPage: 1,
    });
  });

  it('should return one company by id', async () => {
    const company = { id: 1 };
    mockCompanyRepository.findOne.mockResolvedValue(company);

    const result = await service.findOne(1);

    expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(result).toEqual(company);
  });

  it('should delete company', async () => {
    mockCompanyRepository.delete.mockResolvedValue({ affected: 1 });

    const result = await service.remove(1);

    expect(mockCompanyRepository.delete).toHaveBeenCalledWith(1);
    expect(result).toEqual({ affected: 1 });
  });

  it('should throw if company not found on delete', async () => {
    mockCompanyRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove(1)).rejects.toThrow(NotFoundException);
  });

  it('should throw error when creating a company fails', async () => {
    const dto = {
      name: 'Empresa Y',
      tradeName: 'Y LTDA',
      cnpj: '11111111111111',
      address: 'Rua Y',
    };

    mockCompanyRepository.create.mockReturnValue(dto);
    mockCompanyRepository.save.mockRejectedValue(new Error('DB error'));

    await expect(service.create(dto)).rejects.toThrow(
      'Erro ao criar a empresa.',
    );
  });

  it('should throw error when update throws non-NotFound error', async () => {
    const dto = {
      name: 'Empresa Z',
      tradeName: 'Z LTDA',
      cnpj: '22222222222222',
      address: 'Rua Z',
    };

    mockCompanyRepository.preload.mockResolvedValue({ id: 1, ...dto });
    mockCompanyRepository.save.mockRejectedValue(new Error('Generic error'));

    await expect(service.update(1, dto)).rejects.toThrow(
      'Erro ao atualizar a empresa.',
    );
  });

  it('should soft remove a company', async () => {
    const company = { id: 1 };
    mockCompanyRepository.findOne.mockResolvedValue(company);
    mockCompanyRepository.softRemove = jest.fn().mockResolvedValue(undefined);

    await service.softRemove(1);

    expect(mockCompanyRepository.findOne).toHaveBeenCalledWith({
      where: { id: 1 },
    });
    expect(mockCompanyRepository.softRemove).toHaveBeenCalledWith(company);
  });

  it('should throw if company not found on softRemove', async () => {
    mockCompanyRepository.findOne.mockResolvedValue(null);

    await expect(service.softRemove(1)).rejects.toThrow(NotFoundException);
  });
});
