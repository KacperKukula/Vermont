import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import express from 'express';
import { config } from './config.js';
import { AppModule } from './app.module.js';

const app = await NestFactory.create(AppModule, { bodyParser: false });
app.use(helmet());
app.enableCors({ origin: config.CLIENT_ORIGIN, credentials: true });
app.use(express.json({ limit: '32kb' }));
app.use(cookieParser());
app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Require a trusted browser origin for all cookie-authenticated mutations.
  if (
    req.path.startsWith('/api/') && !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
    req.headers.origin !== config.CLIENT_ORIGIN
  ) {
    res.status(403).json({ message: 'Niedozwolone źródło żądania' });
    return;
  }
  // Tokens and signed object URLs must never be cached by shared proxies.
  res.setHeader('Cache-Control', 'no-store');
  next();
});
app.enableShutdownHooks();
await app.listen(config.PORT, '0.0.0.0');
