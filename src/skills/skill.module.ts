import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SkillController } from './skill.controller';

import { JwtService } from '@nestjs/jwt';
import { Skill, SkillSchema } from './schema/Skill.schema';
import { SkillService } from './skill.service';
import { User, UserSchema } from 'src/users/schema/user.schema';
import { UserJobs, UserJobsSchema } from 'src/users/schema/userJobs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Skill.name, schema: SkillSchema },
      { name: User.name, schema: UserSchema },
      { name: UserJobs.name, schema: UserJobsSchema }
    ])
  ],
  providers: [Skill, SkillService, User, UserJobs, JwtService],
  controllers: [SkillController]
})
export class SkillModule { }
