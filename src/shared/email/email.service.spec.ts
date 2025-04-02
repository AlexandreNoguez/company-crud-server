import { EmailService } from './email.service';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs';
import * as handlebars from 'handlebars';
import {
  COMPANY_CREATED_TEMPLATE,
  LIST_UNSUBSCRIBE,
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

    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: mockSendMail,
    });

    (fs.readFileSync as jest.Mock).mockReturnValue('template-source');

    const compiledTemplate = jest
      .fn()
      .mockReturnValue('<html>Email content</html>');
    (handlebars.compile as jest.Mock).mockReturnValue(compiledTemplate);

    emailService = new EmailService();
  });

  it('should load and compile the correct template and send an email', async () => {
    const company = {
      name: 'Empresa X',
      tradeName: 'Fantasia LTDA',
      taxId: '12345678000199',
      address: 'Rua A',
      recipients: 'recipients@empresa.com',
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
      to: company.recipients,
      subject: NEW_COMPANY_CREATED_TITLE,
      html: '<html>Email content</html>',
      headers: {
        'List-Unsubscribe': LIST_UNSUBSCRIBE,
      },
      text: `Nova empresa cadastrada: ${company.name} - ${company.taxId}`,
    });
  });

  it('should throw an error if template file fails to load', async () => {
    (fs.readFileSync as jest.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });

    const company = {
      name: 'Empresa Y',
      tradeName: 'Fantasia Y',
      taxId: '00000000000000',
      address: 'Rua Z',
      recipients: 'falha@teste.com',
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
