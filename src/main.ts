import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieparser from 'cookie-parser'
import { ENV } from './utils/functions';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true, });
  app.use(cookieparser())
  app.enableCors({ credentials: true, origin: ENV.ALLOWED_ORIGIN });
  await app.listen(8080);
}
bootstrap();
