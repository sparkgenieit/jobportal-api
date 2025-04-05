import { Body, Controller, Delete, Get, Param, Post,Query , UseGuards } from '@nestjs/common';
import { CmsDto } from './dto/cms.dto';
import { Cms } from './schema/cms';
import { CmsService } from './cms.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';


@Controller('cms')
@UseGuards(AuthGuard)

export class CmsController {
    constructor(
        private readonly cmsService: CmsService
    ) { }

    @Roles(["superadmin"])
    @Post()
    async createOrUpdate(@Body() dto: CmsDto) {
      return this.cmsService.createOrUpdate(dto);
    }
  
    @Get()
    async getPageContent(
      @Query('category') category: string,
      @Query('page') page: string
    ) {
      return this.cmsService.findOne(category, page);
    }
}
