import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/ (GET) should return HTML with health info', async () => {
    const response = await request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Content-Type', /html/);

    const cleanHtml = response.text.replace(/\s+/g, ' ').trim();

    expect(response.text).toContain('<h1>Health Check</h1>');
    expect(response.text).toMatch(/API:.*UP/);
    expect(cleanHtml).toMatch(/DB:\s*(UP|DOWN)/);
    expect(cleanHtml).toMatch(/Versão:\s*<strong>\d+\.\d+\.\d+<\/strong>/);
  });

  it('/companies (POST) - should create a company', async () => {
    const randomNumber = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const companyPayload = {
      name: `e2e Company ${randomNumber}`,
      tradeName: 'e2e Trade',
      taxId: `11.316.678/${randomNumber}-98`,
      address: 'Rua Teste, 123 - Centro, Cidade Teste - SP',
    };

    await request(app.getHttpServer())
      .post('/companies')
      .send(companyPayload)
      .expect(201);
  });
});
