import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { jobsController } from './jobs.controller';

import { JwtService } from '@nestjs/jwt';
import { Jobs, JobsSchema } from './schema/Jobs.schema';
import { JobsService } from './jobs.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Jobs.name, schema: JobsSchema }
    ])
  ],
  providers: [Jobs, JobsService, JwtService],
  controllers: [jobsController]
})
export class JobsModule {}
