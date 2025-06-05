import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MetaController } from './meta.controller';

import { JwtService } from '@nestjs/jwt';
import { Meta, MetaSchema } from './schema/meta';
import { MetaService } from './meta.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meta.name, schema: MetaSchema }
    ])
  ],
  providers: [Meta, MetaService, JwtService],
  controllers: [MetaController]
})
export class MetaModule { }
