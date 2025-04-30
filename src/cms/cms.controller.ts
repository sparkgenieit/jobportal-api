import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { CmsDto } from './dto/cms.dto';
import { Cms } from './schema/cms';
import { CmsService } from './cms.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';

import { upload } from 'src/utils/multerUpload';
import * as path from 'path';

const filePath = path.join(__dirname, "..", "..", "public", "uploads", "cms");


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

    @Roles(["superadmin"])
@Post('upload-image')
@UseInterceptors(FileInterceptor('file', upload(filePath))) 
async uploadCmsFile(@UploadedFile() file) {
  if (!file) {
    throw new BadRequestException('No file uploaded');
  }

  // You can return file info or a URL to access it
  return {
    message: 'File uploaded successfully',
    filename: file.filename,
    url: `/uploads/cms/${file.filename}`
  };
}
}
