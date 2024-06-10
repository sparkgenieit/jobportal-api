import { Module } from '@nestjs/common';
import { ContactController } from './contact.controller';
import { ContactSerivce } from './contact';
import { MongooseModule } from '@nestjs/mongoose';
import { Contact, ContactSchema } from './schema/contact.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Contact.name, schema: ContactSchema },
    ])
  ],
  controllers: [ContactController],
  providers: [ContactSerivce]
})
export class ContactModule { }
