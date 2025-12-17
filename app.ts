import express from 'express';
import tourRouter from './routes/tourRouter.ts';
import { errorController } from './controllers/errorController.ts';
import authRouter from './routes/authRouter.ts';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

import { xssSanitizer } from './utils/sanitizer.ts';
import { sanitizeMongo } from './utils/sanitizeMongo.ts';
import { reviewRouter } from './routes/reviewRouter.ts';
import { env } from './envSchema.ts';

const app = express();

const limiter = rateLimit({
  max: 100, // 100 requests per window time
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again later.',
});

app.use(helmet());

if (env.ENVIRONMENT === 'production') {
  app.use(
    helmet.hsts({
      maxAge: 60 * 60 * 24 * 365, // 1 year
      includeSubDomains: true,
      preload: true,
    })
  );
}

app.use('/api', limiter);

app.use(express.json());

app.use(xssSanitizer);

app.use(sanitizeMongo);

app.use('/api/tours', tourRouter);
app.use('/api/auth', authRouter);

app.use('/api/reviews', reviewRouter);

app.use(errorController);

export default app;
