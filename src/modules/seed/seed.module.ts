import { Module } from '@nestjs/common';
import { SeedController } from './seed.controller';
import { CompanyModule } from '../company/company.module';

@Module({
  imports: [CompanyModule],
  controllers: [SeedController],
  // providers: [SeedService],
})
export class SeedModule {}
