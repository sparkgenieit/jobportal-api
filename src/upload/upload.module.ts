import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';

import { JwtService } from '@nestjs/jwt';


@Module({
  providers: [JwtService],
  controllers: [UploadController]
})
export class UploadModule { }
