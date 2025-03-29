import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { Company } from 'src/@types/company';
@Injectable()
export class EmailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
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
    templateName: 'company-created.hbs' | 'company-updated.hbs',
    subject: string,
  ): Promise<void> {
    const template = this.loadTemplate(templateName);

    const html = template({
      nome: company.nome,
      cnpj: company.cnpj,
      nomeFantasia: company.nomeFantasia,
      endereco: company.endereco,
    });

    await this.transporter.sendMail({
      to: company.destinatario,
      subject,
      html,
    });
  }
}
