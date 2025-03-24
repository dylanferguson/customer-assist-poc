import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { LogLevel } from '@nestjs/common';
import { config } from 'dotenv';

// Load environment variables before app initialization
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'] as LogLevel[],
  });
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap(); 