import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { CompanyModule } from './company/company.module';
import { JobsModule } from './jobs/jobs.module';
import { AdModule } from './ads/ad.module';
import { SkillModule } from './skills/skill.module';
import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrderModule } from './orders/order.module';
import { CategoryModule } from './categories/category.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './global/global.module';
import { NotificationModule } from './notifications/notifications.module';
import { ContactModule } from './contact/contact.module';
import { ScheduleModule } from '@nestjs/schedule';


@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, }), ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
  }),
  ScheduleModule.forRoot(),
    GlobalModule,
    DatabaseModule,
    UsersModule,
    CompanyModule,
    JobsModule,
    UploadModule,
    AdModule,
    SkillModule,
    OrderModule,
    CategoryModule,
    PaymentModule,
    NotificationModule,
    ContactModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
