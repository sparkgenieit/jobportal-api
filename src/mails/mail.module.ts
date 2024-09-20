import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtService } from '@nestjs/jwt';
import { MailSchema } from './schema/mail.schema';
import { MailController } from './mail.controller';
import { MailService } from './mail.services';
import { EmployerMailSchema } from './schema/employerMail.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Mail", schema: MailSchema },
            { name: "EmployerMail", schema: EmployerMailSchema },
        ])
    ],
    controllers: [MailController],
    providers: [MailService, JwtService]
})
export class MailModule { }
