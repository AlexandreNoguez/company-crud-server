import { Module } from '@nestjs/common';
import { CompanyService } from './company.service';
import { CompanyController } from './company.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Company } from './entities/company.entity';
import { EmailModule } from 'src/shared/email/email.module';

@Module({
  imports: [TypeOrmModule.forFeature([Company]), EmailModule],
  controllers: [CompanyController],
  providers: [CompanyService],
})
export class CompanyModule {}
