import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { CompanyModule } from './company/company.module';
import { JobsModule } from './jobs/jobs.module';
import { AdModule } from './ads/ads.module';
import { SkillModule } from './skills/skill.module';
import { CmsModule } from './cms/cms.module';
import { MetaModule } from './meta/meta.module';

import { UploadModule } from './upload/upload.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { OrderModule } from './orders/order.module';
import { CategoryModule } from './categories/category.module';
import { PaymentModule } from './payment/payment.module';
import { ConfigModule } from '@nestjs/config';
import { GlobalModule } from './global/global.module';
import { NotificationModule } from './notifications/notifications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { MailModule } from './mails/mail.module';
import { LogModule } from './audit/logs.module';
import { GalleryGridModule } from './gallery-grid/gallery-grid.module';
import { GalleryAdModule } from './gallery-ad/gallery-ad.module';


import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    EventEmitterModule.forRoot({ delimiter: "." }),
    ScheduleModule.forRoot(),
    GlobalModule,
    DatabaseModule,
    UsersModule,
    CompanyModule,
    JobsModule,
    UploadModule,
    AdModule,
    SkillModule,
    CmsModule,
    MetaModule,
    OrderModule,
    CategoryModule,
    PaymentModule,
    NotificationModule,
    MailModule,
    LogModule,
    GalleryGridModule,
    GalleryAdModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
