import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CmsController } from './cms.controller';

import { JwtService } from '@nestjs/jwt';
import { Cms, CmsSchema } from './schema/cms';
import { CmsService } from './cms.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Cms.name, schema: CmsSchema }
    ])
  ],
  providers: [Cms, CmsService, JwtService],
  controllers: [CmsController]
})
export class CmsModule { }
