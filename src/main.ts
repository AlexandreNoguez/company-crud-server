import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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
