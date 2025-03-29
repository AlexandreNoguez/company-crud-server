import { Test, TestingModule } from '@nestjs/testing';
import { CompanyController } from './company.controller';
import { CompanyService } from './company.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { NotFoundException } from '@nestjs/common';

const mockCompanyService = {
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('CompanyController', () => {
  let controller: CompanyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyController],
      providers: [
        {
          provide: CompanyService,
          useValue: mockCompanyService,
        },
      ],
    }).compile();

    controller = module.get<CompanyController>(CompanyController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a company', async () => {
    const dto: CreateCompanyDto = {
      name: 'Empresa Nova',
      tradeName: 'Nome Fantasia',
      cnpj: '12345678000199',
      address: 'Rua X',
    };

    const savedCompany = { id: 1, ...dto };

    mockCompanyService.create.mockResolvedValue(savedCompany);

    const result = await controller.create(dto);

    expect(mockCompanyService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(savedCompany);
  });

  it('should return all companies', async () => {
    const companies = [{ id: 1 }, { id: 2 }];
    mockCompanyService.findAll.mockResolvedValue(companies);

    const result = await controller.findAll();

    expect(mockCompanyService.findAll).toHaveBeenCalled();
    expect(result).toEqual(companies);
  });

  it('should return a company by id', async () => {
    const company = { id: 1, name: 'Empresa 1' };
    mockCompanyService.findOne.mockResolvedValue(company);

    const result = await controller.findOne('1');

    expect(mockCompanyService.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(company);
  });

  it('should update a company', async () => {
    const dto: UpdateCompanyDto = {
      name: 'Atualizado',
      tradeName: 'Novo Nome',
      cnpj: '98765432100010',
      address: 'Rua Y',
    };

    const updated = { id: 1, ...dto };

    mockCompanyService.update.mockResolvedValue(updated);

    const result = await controller.update('1', dto);

    expect(mockCompanyService.update).toHaveBeenCalledWith(1, dto);
    expect(result).toEqual(updated);
  });

  it('should delete a company', async () => {
    const deletionResult = { affected: 1 };

    mockCompanyService.remove.mockResolvedValue(deletionResult);

    const result = await controller.remove('1');

    expect(mockCompanyService.remove).toHaveBeenCalledWith(1);
    expect(result).toEqual(deletionResult);
  });

  it('should throw if company not found on remove', async () => {
    mockCompanyService.remove.mockRejectedValue(
      new NotFoundException('Empresa com ID 99 não encontrada'),
    );

    await expect(controller.remove('99')).rejects.toThrow(NotFoundException);
  });
});
