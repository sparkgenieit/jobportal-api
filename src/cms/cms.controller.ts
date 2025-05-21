import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CmsDto } from './dto/cms.dto';
import { CmsService } from './cms.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Public } from 'src/auth/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/utils/multerUpload';
import * as path from 'path';

const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'cms');

@Controller('cms')
@UseGuards(AuthGuard)   // apply globally to this controller
export class CmsController {
  constructor(private readonly cmsService: CmsService) {}

  @Roles(['superadmin'])
  @Post()
  async createOrUpdate(@Body() dto: CmsDto) {
    return this.cmsService.createOrUpdate(dto);
  }

  @Public()              // <-- mark this route as public
  @Get()
  async getPageContent(
    @Query('category') category: string,
    @Query('page') page: string,
  ) {
    return this.cmsService.findOne(category, page);
  }

  @Roles(['superadmin'])
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', upload(filePath)))
  async uploadCmsFile(@UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      url: `/uploads/cms/${file.filename}`,
    };
  }
}
