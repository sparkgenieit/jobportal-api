import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactSerivce } from './contact';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './schema/contact.schema';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
    ])
  ],
  controllers: [ContactController],
  providers: [ContactSerivce, JwtService]
})
export class ContactModule { }
