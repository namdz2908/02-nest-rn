import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT');

  // ValidationPipe là 1 cơ chế để hệ thống xử lí dữ liễu (xác thực và biến đổi) giữa request và controller
  app.useGlobalPipes(new ValidationPipe(
    {
      whitelist: true, // Khi set là true thì những trường không có trong DTO sẽ không được gửi trong request
      forbidNonWhitelisted: true, // gặp trường không tồn tại thì báo exception
    }
  ));

  app.setGlobalPrefix('api/v1', { exclude: [''] });

  // config cors
  app.enableCors(
    {
      "origin": true,
      "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
      "preflightContinue": false,
      credentials: true
    }
  );

  await app.listen(port);
}
bootstrap();
