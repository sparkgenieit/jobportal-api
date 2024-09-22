import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieparser from 'cookie-parser'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody: true, });
  app.use(cookieparser())
  app.enableCors({ credentials: true, origin: 'http://localhost:3000' });
  await app.listen(8080);
}
bootstrap();
