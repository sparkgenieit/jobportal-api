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
import { MetaDto } from './dto/meta.dto';
import { MetaService } from './meta.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Public } from 'src/auth/public.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { upload } from 'src/utils/multerUpload';
import * as path from 'path';

const filePath = path.join(__dirname, '..', '..', 'public', 'uploads', 'meta');

@Controller('meta')
@UseGuards(AuthGuard)   // apply globally to this controller
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Roles(['superadmin'])
  @Post()
  async createOrUpdate(@Body() dto: MetaDto) {
    return this.metaService.createOrUpdate(dto);
  }

  @Public()              // <-- mark this route as public
  @Get()
  async getPageMeta(
    @Query('page') page: string,
    @Query('category') category?: string, // ✅ Optional
  ) {
    const baseTitle = `Working Holiday Jobs New Zealand for ${page}`;
    const fullTitle = category ? `${baseTitle} in ${category}` : baseTitle;

    return {
      title: fullTitle,
      description: "Powered by CommonLayout. Discover seasonal work and travel jobs in New Zealand.",
      keywords: "New Zealand jobs, seasonal work, backpacker jobs, working holiday visa, travel NZ"
    };
  }

  @Roles(['superadmin'])
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file', upload(filePath)))
  async uploadMetaFile(@UploadedFile() file) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return {
      message: 'File uploaded successfully',
      filename: file.filename,
      url: `/uploads/meta/${file.filename}`,
    };
  }
}
