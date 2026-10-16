import 'reflect-metadata';
import { config as loadEnv } from 'dotenv';
loadEnv();
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { env } from './env';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({ logger: { level: env.LOG_LEVEL } }),
  );

  app.enableCors({
    origin: env.CORS_ORIGINS,
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('Joymee API')
    .setDescription('Marketplace backend')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen({ port: env.PORT, host: '0.0.0.0' });

  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${env.PORT}  (docs: /docs)`);
}

bootstrap();
