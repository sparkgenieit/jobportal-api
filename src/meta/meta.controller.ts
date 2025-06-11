import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MetaDto } from './dto/meta.dto';
import { MetaService } from './meta.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Public } from 'src/auth/public.decorator';

@Controller('meta')
@UseGuards(AuthGuard) // apply globally to this controller
export class MetaController {
  constructor(private readonly metaService: MetaService) {}

  @Roles(['superadmin'])
  @Post()
  async createOrUpdate(@Body() dto: MetaDto) {
    return this.metaService.createOrUpdate(dto);
  }

  @Public()
  @Get()
  async getPageMeta(
    @Query('page') page: string,
    @Query('category') category?: string,
  ) {
    console.log()
    const record = await this.metaService.findOne(category, page);
    if (record) {
      return {
        title: record.title,
        description: record.description,
        keywords: record.keywords,
      };
    }

    // Fallback SEO content
    const baseTitle = `Working Holiday Jobs New Zealand for ${page}`;
    const fullTitle = category ? `${baseTitle} in ${category}` : baseTitle;

    return {
      title: fullTitle,
      description:
        'Powered by CommonLayout. Discover seasonal work and travel jobs in New Zealand.',
      keywords:
        'New Zealand jobs, seasonal work, backpacker jobs, working holiday visa, travel NZ',
    };
  }
}
