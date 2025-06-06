import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { LogService } from './logs.service';
import { AdminLog, AdminLogSchema } from './AdminLog.schema';
import { Log, LogSchema } from './Log.schema';
import { AdLog, AdLogSchema } from './AdLog.schema';

import { LogController } from './logs.controller';



@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Log.name, schema: LogSchema },
            { name: AdLog.name, schema: AdLogSchema },
            { name: AdminLog.name, schema: AdminLogSchema },
        ]),
    ],
    controllers: [LogController],
    providers: [LogService, JwtService],
    exports: [LogService]
})
export class LogModule { }
