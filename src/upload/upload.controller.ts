import {
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import Path = require('path');
import * as fs from 'fs';
import { FileInterceptor } from '@nestjs/platform-express';

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
      const filename: string = 'myfile-' + randomUUID();
      const extension: string = Path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};

@Controller('upload')
export class UploadController {
  // @UseGuards(JwtAuthGuard) your methode of guard
  @Post()
  @UseInterceptors(FileInterceptor('file', storage))
  uploadFile(@UploadedFile() file: any) {
    return file;
  }
}
