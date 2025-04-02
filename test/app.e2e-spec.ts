import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
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

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer()).get('/').expect(200).expect({
      status: 'UP',
      version: '1.0.0',
      description: 'This is a simple health check response',
    });
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
