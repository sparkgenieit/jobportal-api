import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { CategoryDto } from './dto/Category.dto';
import { Category } from './schema/Category.schema';
import { CategoryService } from './category.service';
import { AuthGuard } from 'src/auth/auth.guard';


@Controller('categories')

export class CategoryController {
    constructor(
        private readonly categoryService: CategoryService
    ) { }
    @UseGuards(AuthGuard)
    @Post('create')
    async createUserDto(@Body() CategoryDto: CategoryDto): Promise<Category> {
        return await this.categoryService.createCategory(CategoryDto);
    }

    @Get("all")
    async getCategories(): Promise<Category[]> {
        return await this.categoryService.getCategories()
    }
    @UseGuards(AuthGuard)
    @Put('update/:id')
    async CategorydDto(@Param() data, @Body() CategoryDto: CategoryDto): Promise<Category[]> {
        console.log("updatecatagories id", data.id)
        return await this.categoryService.updateCategory(data.id, CategoryDto);
    }
    @UseGuards(AuthGuard)
    @Get(':id')
    async getCategory(@Param() data): Promise<Category[]> {
        console.log(data.id);
        return await this.categoryService.getCategory(data.id);
    }
    @UseGuards(AuthGuard)
    @Delete('delete/:id')
    async deleteCategory(@Param() data): Promise<Category[]> {
        return await this.categoryService.deleteCategory(data.id);
    }
}
