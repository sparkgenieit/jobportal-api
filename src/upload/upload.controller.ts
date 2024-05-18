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
import path = require('path');

const storage = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      console.log(req.query);
      const userPath = req.query.path;
      let path = `public/uploads/${userPath}`;
      console.log(fs.existsSync(path));
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      callback(null, path);
    },

    filename: (req, file, cb) => {
      console.log(req);
      console.log(file);
      const filename: string = 'myfile-' + randomUUID();
      const extension: string = Path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};

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
    const filePath = Path.join(__dirname,'..', '..',"/public/uploads/" +path+"/"+fileName);
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
}
