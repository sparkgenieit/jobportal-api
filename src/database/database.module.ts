import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ENV } from 'src/utils/functions';

@Module({
    imports: [
        MongooseModule.forRoot(ENV.DATABASE_URL)
    ]
})
export class DatabaseModule { }