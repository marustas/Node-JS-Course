import express from 'express';
import tourRouter from './routes/tourRouter.ts';
import { errorController } from './controllers/errorController.ts';
import authRouter from './routes/authRouter.ts';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import ExpressMongoSanitize from 'express-mongo-sanitize';
import { xssSanitizer } from './utils/sanitizer.ts';

const app = express();

const limiter = rateLimit({
  max: 100, // 100 requests per window time
  windowMs: 60 * 60 * 1000, // 1 hour
  message: 'Too many requests from this IP, please try again later.',
});

app.use(helmet());

app.use('/api', limiter);

app.use(ExpressMongoSanitize());

app.use(xssSanitizer);

app.use(express.json());
app.use('/api/tours', tourRouter);
app.use('/api/auth', authRouter);

app.use(errorController);

export default app;
