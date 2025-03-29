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
    mockCompanyRepository.find.mockResolvedValue(companies);

    const result = await service.findAll();

    expect(mockCompanyRepository.find).toHaveBeenCalled();
    expect(result).toEqual(companies);
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
});
