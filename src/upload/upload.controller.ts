import {
  Controller,
  Post,
  Get,
  Res,
  UploadedFile,
  Query,
  StreamableFile,
  Header,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { createReadStream } from 'fs';

import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import Path = require('path');

import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';

const storage = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const userPath = req.query.path;
      let path = `public/uploads/${userPath}`;
      console.log(fs.existsSync(path));
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      callback(null, path);
    },

    filename: (req, file, cb) => {
      const filename: string = 'file-' + randomUUID() + "_ON_" + file.originalname;
      cb(null, filename);
    },
  }),
};

UseGuards(AuthGuard)
@Controller('upload')
export class UploadController {
  constructor(
  ) { }

  @Get("allfiles")
  getAllUsers(): any {
    return {};
  }
  @Get('file')
  // @Header('Content-Type', 'application/msword')
  async getFile(@Query('path') path, @Query('file') fileName, @Res({ passthrough: true }) res: Response): Promise<StreamableFile> {
    const filePath = Path.join(__dirname, '..', '..', "/public/uploads/" + path + "/" + fileName);
    const file = createReadStream(filePath);
    return new StreamableFile(file);
  }


  // @UseGuards(JwtAuthGuard) your methode of guard
  @Post('cvs')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file: any) {
    return file;
  }

  // @UseGuards(JwtAuthGuard) your methode of guard
  @Post('coverLetters')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadCoverLetter(@UploadedFile() file: any) {
    return file;
  }

  // @UseGuards(JwtAuthGuard) your methode of guard
  @Post('logos')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadLogo(@UploadedFile() file: any) {
    return file;
  }

  // @UseGuards(JwtAuthGuard) your methode of guard
  @Post('skillPhoto')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadSkillPhoto(@UploadedFile() file: any) {
    return file;
  }

  // @UseGuards(JwtAuthGuard) your methode of guard
  @Post('categoryPhoto')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadCategoryPhoto(@UploadedFile() file: any) {
    return file;
  }
  @Post('banners')
  @UseInterceptors(FileInterceptor('file', storage))
  uploadBanner(@UploadedFile() file: any) {
    return file;
  }
}
