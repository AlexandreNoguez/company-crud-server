import './instrument';

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { GlobalHttpExceptionFilter } from './shared/filters/http-exception/global-http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalHttpExceptionFilter());
  app.enableCors({
    origin: process.env.CLIENT_URL,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const configService = app.get(ConfigService);

  const isDev = configService.get<string>('NODE_ENV') !== 'production';

  if (isDev) {
    const config = new DocumentBuilder()
      .setTitle('KPMG-fullstack-test API')
      .setDescription('API for managing companies')
      .setVersion('1.0')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    console.log('Swagger running at /api');
  }

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
