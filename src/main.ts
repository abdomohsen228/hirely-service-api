import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { getCorsConfig } from './config/corsConfig';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import validationPipeConfig from './config/pipesConfig';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe(validationPipeConfig));
  const config = new DocumentBuilder()
    .setTitle('hirely Service API')
    .setDescription('API documentation for hirely Service')
    .setVersion('1.0')
    .addTag('hirel-service')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  app.enableCors(getCorsConfig(configService));

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
