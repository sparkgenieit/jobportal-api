import {
  Controller,
  Post,
  Get,
  Res,
  UploadedFile,
  Query,
  StreamableFile,
  UseGuards,
  UseInterceptors,
  Req,
  HttpException,
} from '@nestjs/common';
import { createReadStream } from 'fs';

import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import * as fs from 'fs';
import * as Path from 'path';
import { isBad } from 'src/utils/functions';
import { EventEmitter2 } from '@nestjs/event-emitter';



const storage = {
  storage: diskStorage({
    destination: (req, file, callback) => {
      const userPath = req.query.path;
      let path = `public/uploads/${userPath}`;
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path, { recursive: true });
      }
      callback(null, path);
    },

    filename: (req, file, cb) => {
      const filename: string = 'file-' + randomUUID() + Path.extname(file.originalname);
      cb(null, filename);
    },
  }),
};

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(
    private eventEmitter: EventEmitter2,
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
  async uploadFile(@UploadedFile() file: any, @Req() req, @Res({ passthrough: true }) res) {

    const filePath = Path.join(__dirname, '..', '..', file.path);
    const isAbusive = await isBad(filePath);


    if (isAbusive) {
      fs.unlinkSync(filePath);
      this.eventEmitter.emit('user.block', req?.user?.id);
      res.clearCookie('Token');
      throw new HttpException('Abusive content detected', 400);
    }
    return file;
  }

  // @UseGuards(JwtAuthGuard) your methode of guard
  @Post('coverLetters')
  @UseInterceptors(FileInterceptor('file', storage))
  async uploadCoverLetter(@UploadedFile() file: any, @Req() req, @Res({ passthrough: true }) res) {

    const filePath = Path.join(__dirname, '..', '..', file.path);
    const isAbusive = await isBad(filePath);

    if (isAbusive) {
      fs.unlinkSync(filePath);
      this.eventEmitter.emit('user.block', req?.user?.id);
      res.clearCookie('Token');
      throw new HttpException('Abusive content detected', 400);
    }

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
