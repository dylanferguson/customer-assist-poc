import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ZodValidationPipe } from 'nestjs-zod';
import { ConsoleLogger } from '@nestjs/common';
import { config } from 'dotenv';

// Load environment variables before app initialization
config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: new ConsoleLogger(),
  });
  app.setGlobalPrefix('v1');
  app.useGlobalPipes(new ZodValidationPipe());
  app.enableCors();
  await app.listen(3000);
}
bootstrap(); 