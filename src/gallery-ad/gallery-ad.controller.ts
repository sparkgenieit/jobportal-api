import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UploadedFiles,
  UseInterceptors,
  Body,
  Patch,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

import { GalleryAdService } from './gallery-ad.service';
import { CreateGalleryAdDto } from './dto/gallery-ad.dto';

const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'gallery-ads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const filename = `${file.fieldname}-${timestamp}${ext}`;
    cb(null, filename);
  },
});

@Controller('gallery-ad')
export class GalleryAdController {
  constructor(private readonly service: GalleryAdService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('images', 2, {
      storage,
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          cb(new Error('Only image files are allowed'), false);
        } else {
          cb(null, true);
        }
      },
    })
  )
  async create(
    @UploadedFiles() files: Express.Multer.File[],
    @Body(ValidationPipe) dto: CreateGalleryAdDto
  ) {
    if (files && files.length) {
      if (files[0]) dto.blockImage = files[0].filename;
      if (files[1]) dto.hoverImage = files[1].filename;
    }

    return this.service.create(dto);
  }

@Get()
  findAll(
    @Query('category') category?: string,
    @Query('location') location?: string
  ) {
    
    return this.service.findByCategoryOrLocation(category, location);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @UseInterceptors(
  FilesInterceptor('images', 2, {
    storage,
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.startsWith('image/')) {
        cb(new Error('Only image files are allowed'), false);
      } else {
        cb(null, true);
      }
    },
  })
)
@Patch(':id')
async update(
  @Param('id') id: string,
  @UploadedFiles() files: Express.Multer.File[],
  @Body(ValidationPipe) dto: CreateGalleryAdDto
) {
  if (files && files.length) {
    if (files[0]) dto.blockImage = files[0].filename;
    if (files[1]) dto.hoverImage = files[1].filename;
  }

  return this.service.updateGalleryAd(id, dto);
}


  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
