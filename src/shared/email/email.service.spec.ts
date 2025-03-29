import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import {
  COMPANY_CREATED_TEMPLATE,
  NEW_COMPANY_CREATED_TITLE,
} from '../../constants/email-templates';

jest.mock('nodemailer');
jest.mock('fs');
jest.mock('handlebars');

describe('EmailService', () => {
  let emailService: EmailService;
  const mockSendMail = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock do transportador do nodemailer
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    // Mock do fs
    (fs.readFileSync as jest.Mock).mockReturnValue('template-source');

    // Mock do handlebars
    const compiledTemplate = jest
      .fn()
      .mockReturnValue('<html>Email content</html>');
    (handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

    emailService = new EmailService();
  });

  it('should load and compile the correct template and send an email', async () => {
    const company = {
      nome: 'Empresa X',
      nomeFantasia: 'Fantasia LTDA',
      cnpj: '12345678000199',
      endereco: 'Rua A',
      destinatario: 'destinatario@empresa.com',
    };

    await emailService.sendCompanyNotification(
      company,
      COMPANY_CREATED_TEMPLATE,
      NEW_COMPANY_CREATED_TITLE,
    );

    expect(fs.readFileSync).toHaveBeenCalledWith(
      expect.stringContaining('company-created.hbs'),
      'utf8',
    );

    expect(handlebars.compile).toHaveBeenCalledWith('template-source');
    expect(mockSendMail).toHaveBeenCalledWith({
      to: company.destinatario,
      subject: NEW_COMPANY_CREATED_TITLE,
      html: '<html>Email content</html>',
      headers: {
        'List-Unsubscribe': '<mailto:suporte@alexandrenoguez.dev.br>',
      },
      text: `Nova empresa cadastrada: ${company.nome} - ${company.cnpj}`,
    });
  });

  it('should throw an error if template file fails to load', async () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });

    const company = {
      nome: 'Empresa Y',
      nomeFantasia: 'Fantasia Y',
      cnpj: '00000000000000',
      endereco: 'Rua Z',
      destinatario: 'falha@teste.com',
    };

    await expect(
      emailService.sendCompanyNotification(
        company,
        COMPANY_CREATED_TEMPLATE,
        'Erro de template',
      ),
    ).rejects.toThrow(
      'Failed to load template company-created.hbs: File not found',
    );
  });
});
