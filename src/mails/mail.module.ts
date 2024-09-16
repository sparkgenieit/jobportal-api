import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { JwtService } from '@nestjs/jwt';
import { MailSchema } from './mail.schema';
import { MailController } from './mail.controller';
import { MailService } from './mail.services';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: "Mail", schema: MailSchema },
        ])
    ],
    controllers: [MailController],
    providers: [MailService, JwtService]
})
export class MailModule { }
