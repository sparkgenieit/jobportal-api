import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CategoryDto } from './dto/Category.dto';
import { Category } from './schema/Category.schema';
import { CategoryService } from './category.service';


@Controller('categories')
export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService
    ) { }

    @Post('create')
    async createUserDto(@Body()CategoryDto:CategoryDto): Promise<Category> {
        return await this.categoryService.createCategory(CategoryDto);
    }

    @Get("all")
    async getCategories(): Promise<Category[]> {
        return await this.categoryService.getCategories()
    }

    @Put('update/:id')
    async CategorydDto(@Param() data, @Body()CategoryDto:CategoryDto): Promise<Category[]> {
        console.log("updatecatagories id", data.id)
        return await this.categoryService.updateCategory(data.id,CategoryDto);
    }

    @Get(':id')
    async getCategory(@Param() data): Promise<Category[]> {
        console.log(data.id);
        return await this.categoryService.getCategory(data.id);
    }
}
