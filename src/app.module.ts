import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CompanyModule } from './company/company.module';
import { JobsModule } from './jobs/jobs.module';
import { AdModule } from './ads/ad.module';
import { SkillModule } from './skills/skill.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrderModule } from './orders/order.module';
import { CategoryModule } from './categories/category.module';
import { StripeModule } from './stripe/stripe.module';
import { ConfigModule } from '@nestjs/config';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, }), ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
  }), DatabaseModule, UsersModule, CompanyModule, JobsModule, AuthModule, UploadModule, AdModule, SkillModule, OrderModule, CategoryModule, StripeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
