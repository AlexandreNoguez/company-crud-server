import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SentryGlobalFilter, SentryModule } from '@sentry/nestjs/setup';

import { EmailService } from './shared/email/email.service';

import { CompanyModule } from './modules/company/company.module';
import { EmailModule } from './shared/email/email.module';
import { SeedModule } from './modules/seed/seed.module';
import { HealthModule } from './modules/health/health.module';
import { StatusController } from './modules/status/status.controller';
import { StatusModule } from './modules/status/status.module';

@Module({
  imports: [
    SentryModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST,
      port: +(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRES_PASSWORD,
      database: process.env.POSTGRES_DB,
      autoLoadEntities: true,
      synchronize: true, // use false in production, should be used only in development
      logging: process.env.POSTGRES_LOGGING === 'true',
    }),
    CompanyModule,
    EmailModule,
    SeedModule,
    HealthModule,
    StatusModule,
  ],
  controllers: [StatusController],
  providers: [
    EmailService,
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
