import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactSerivce } from './contact';
import { MongooseModule } from '@nestjs/mongoose';
import { ContactSchema } from './schema/contact.schema';
import { JwtService } from '@nestjs/jwt';
import { CompanyProfileSchema } from 'src/company/schema/companyProfile.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Contact", schema: ContactSchema },
      { name: "CompanyProfile", schema: CompanyProfileSchema },
    ])
  ],
  controllers: [ContactController],
  providers: [ContactSerivce, JwtService]
})
export class ContactModule { }
