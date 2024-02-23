import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { JobsModule } from './jobs/jobs.module';

@Module({
  imports: [DatabaseModule, UsersModule, CompanyModule, JobsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
