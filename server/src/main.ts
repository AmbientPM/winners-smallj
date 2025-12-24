import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { WsAdapter } from '@nestjs/platform-ws';
import { BigIntSerializerInterceptor } from './api/interceptors/bigint-serializer.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join, resolve } from 'path';
import { Request, Response, NextFunction } from 'express';
import { existsSync } from 'fs';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  // Enable CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  app.useGlobalInterceptors(new BigIntSerializerInterceptor());

  // Use WebSocket adapter
  app.useWebSocketAdapter(new WsAdapter(app));

  // Dynamically resolve client/out path for both Docker and local
  let clientOutPathCandidates = [
    resolve(process.cwd(), 'client', 'out'), // Docker
    resolve(__dirname, '..', '..', 'client', 'out'), // Local dev (from server/src)
    resolve(__dirname, '..', 'client', 'out'), // Local dev (from dist)
  ];
  const clientOutPath = clientOutPathCandidates.find(p => existsSync(p)) || clientOutPathCandidates[0];
  app.useStaticAssets(clientOutPath);

  // SPA fallback - serve index.html for non-API routes that don't match static files
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Skip API and WebSocket routes
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
      return next();
    }
    // For all other routes, serve index.html (SPA routing)
    res.sendFile(resolve(clientOutPath, 'index.html'));
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
