import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Company } from '../../@types/company';
import { EmailTemplatesNames } from '../../enums/email-templates.enum';
@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      logger: false, // change to true if you want to see the logs
      debug: false, // change to true if you want to see the logs
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: process.env.MAILER_SECURE === 'true',
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
      },
    } as nodemailer.TransportOptions);
  }

  private loadTemplate(templateName: string): handlebars.TemplateDelegate {
    try {
      const templatesFolderPath = path.resolve(__dirname, 'templates');
      const templatePath = path.join(templatesFolderPath, templateName);
      const templateSource = fs.readFileSync(templatePath, 'utf8');
      return handlebars.compile(templateSource);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new Error(
        `Failed to load template ${templateName}: ${errorMessage}`,
      );
    }
  }

  async sendCompanyNotification(
    company: Company,
    templateName: EmailTemplatesNames,
    subject: string,
  ): Promise<void> {
    const template = this.loadTemplate(templateName);

    const html = template({
      name: company.name,
      taxId: company.taxId,
      tradeName: company.tradeName,
      address: company.address,
    });

    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: company.recipients,
      subject,
      text: `Nova empresa cadastrada: ${company.name} - ${company.taxId}`,
      html,
      headers: {
        'List-Unsubscribe': '<mailto:suporte@alexandrenoguez.dev.br>',
      },
    });
  }
}
