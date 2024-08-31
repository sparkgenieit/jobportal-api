import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SkillDto } from './dto/skill.dto';
import { Skill } from './schema/Skill.schema';
import { SkillService } from './skill.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';


@Controller('skills')
@UseGuards(AuthGuard)

export class SkillController {
    constructor(
        private readonly skillService: SkillService
    ) { }

    @Roles(["superadmin"])
    @Post('create')
    async createUserDto(@Body() SkillDto: SkillDto): Promise<Skill> {
        return await this.skillService.createSkill(SkillDto);
    }

    @Roles(["superadmin"])
    @Get("all")
    async getSkills(): Promise<Skill[]> {
        return await this.skillService.getSkills()
    }

    @Roles(["superadmin"])
    @Put('update/:id')
    async SkillDto(@Param() data, @Body() SkillDto: SkillDto): Promise<Skill[]> {
        console.log("update skills id", data.id)
        return await this.skillService.updateSkill(data.id, SkillDto);
    }

    @Roles(["superadmin"])
    @Get(':id')
    async getAd(@Param() data): Promise<Skill[]> {
        console.log(data.id);
        return await this.skillService.getSkill(data.id);
    }

    @Roles(["superadmin"])
    @Delete('delete/:id')
    async deleteSkill(@Param() data): Promise<Skill[]> {
        return await this.skillService.deleteSkill(data.id);
    }
}
