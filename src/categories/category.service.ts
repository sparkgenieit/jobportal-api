import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { Category } from './schema/Category.schema';
import { CategoryDto } from './dto/Category.dto';
import { User } from 'src/users/schema/user.schema';
import { UserJobs } from 'src/users/schema/userJobs.schema';
import { UserJobsDto } from 'src/users/dto/user-jobs.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private readonly catagoriesModel: Model<Category>,
    @InjectModel(UserJobs.name) private readonly UserJobsModel: Model<UserJobs>,
    @InjectModel(User.name) private userModel: Model<User>
  ) { }

  async createCategory(CategoryDto: CategoryDto): Promise<any> {
    // const isJob = await this.userModel.findOne({email});
    // if (isUser) {
    //   throw new HttpException({message: "The given email "+email+" already exsit"}, HttpStatus.BAD_REQUEST);
    // }

    //CreateUserDto.token = '';
    CategoryDto.status = 'active';
    return await this.catagoriesModel.create(CategoryDto);

  }

  async updateCategory(categoryId, catagoriesDto: CategoryDto): Promise<any> {
    console.log(categoryId);
    const isJob = await this.catagoriesModel.findOne({ _id: categoryId });
    console.log(isJob);
    if (!isJob) {
      throw new HttpException({ message: "The given Category does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      catagoriesDto.status = 'queue';
      return await this.catagoriesModel.findOneAndUpdate({ _id: categoryId }, catagoriesDto);
    }
  }

  async createBulkCategories(Categories: CategoryDto[]) {
    await this.catagoriesModel.insertMany(Categories, { ordered: false })
    return { message: "Success" }
  }

  async getCategories(): Promise<Category[]> {
    return await this.catagoriesModel.find().exec()
  }

  async getCategory(categoryId): Promise<any> {
    categoryId = new mongoose.Types.ObjectId(categoryId);

    const isCategory = await this.catagoriesModel.findOne({ _id: categoryId });
    console.log(isCategory);
    if (!isCategory) {
      throw new HttpException({ message: "The given Category does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {
      return await this.catagoriesModel.findOne({ _id: categoryId });
    }
  }


  async deleteCategory(categoryId): Promise<any> {
    categoryId = new mongoose.Types.ObjectId(categoryId);
    //userProfileDto.user_id = user_id;
    const isCategory = await this.catagoriesModel.findOne({ _id: categoryId });
    if (!isCategory) {
      throw new HttpException({ message: "The given Category does not exsit" }, HttpStatus.BAD_REQUEST);
    } else {

      return await this.catagoriesModel.deleteOne({ _id: categoryId })
    }
  }

  async deleteAll() {
    await this.catagoriesModel.deleteMany({})
    return { message: "All Categories deleted " }
  }
}
