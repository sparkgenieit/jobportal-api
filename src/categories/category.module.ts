import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CategoryController } from './category.controller';

import { JwtService } from '@nestjs/jwt';
import { Category, CategorySchema } from './schema/Category.schema';
import { CategoryService } from './category.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Category.name, schema: CategorySchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobs.name, schema: UserJobsSchema }
    ])
  ],
  providers: [Category, CategoryService, User, UserJobs, JwtService],
  controllers: [CategoryController]
})
export class CategoryModule { }
