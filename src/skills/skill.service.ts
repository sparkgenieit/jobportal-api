import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Skill } from './schema/Skill.schema';
import { SkillDto } from './dto/Skill.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { UserJobsDto } from 'src/users/dto/user-jobs.dto';

@Injectable()
export class SkillService {
  constructor(
    @InjectModel(Skill.name) private readonly skillsModel: Model<Skill>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async createSkill(skillsDto: SkillDto): Promise<any> {
    // const isJob = await this.userModel.findOne({email});
    // if (isUser) {
    //   throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
    // }

    //CreateUserDto.token = '';
    skillsDto.status = 'active';
    return await this.skillsModel.create(skillsDto);

  }

  async updateSkill(skillId, skillsDto: SkillDto): Promise<any> {
    const isJob = await this.skillsModel.findOne({ _id: skillId });
    if (!isJob) {
      throw new HttpException({ message: "The given Skill does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      skillsDto.status = 'queue';
      return await this.skillsModel.findOneAndUpdate({ _id: skillId }, skillsDto);
    }
  }

  async getSkills(): Promise<Skill[]> {
    return await this.skillsModel.find().exec()
  }

  async getSkill(skillId): Promise<any> {
    skillId = new mongoose.Types.ObjectId(skillId);

    const isSkill = await this.skillsModel.findOne({ _id: skillId });
    console.log(isSkill);
    if (!isSkill) {
      throw new HttpException({ message: "The given Skill does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.skillsModel.findOne({ _id: skillId });
    }
  }


  async deleteSkill(skillId): Promise<any> {
    console.log(skillId);
    skillId = new mongoose.Types.ObjectId(skillId);
    //userProfileDto.user_id = user_id;
    const isSkill = await this.skillsModel.findOne({ _id: skillId });
    if (!isSkill) {
      throw new HttpException({ message: "The given Skill does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {

      return await this.skillsModel.deleteOne({ _id: skillId })
    }
  }
}
