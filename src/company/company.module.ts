import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CompanyService } from './company.service';
import { CompaniesController } from './company.controller';

import { JwtService } from '@nestjs/jwt';
import { CompanyProfile, CompanyProfileSchema } from './schema/companyProfile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CompanyProfile.name, schema: CompanyProfileSchema }
    ])
  ],
  providers: [CompanyProfile, CompanyService, JwtService],
  controllers: [CompaniesController]
})
export class CompanyModule {}
