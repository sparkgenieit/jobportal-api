import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import express from 'express';
import path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  await app.listen(8080);
}
bootstrap();
