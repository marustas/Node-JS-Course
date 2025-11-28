import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DB_CONNECTION: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
  ENVIRONMENT: z.enum(['development', 'production', 'test']).default('development'),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  EMAIL_HOST: z.string().min(1),
  EMAIL_PORT: z.string().default('587'),
  EMAIL_USERNAME: z.string().min(1),
  EMAIL_PASSWORD: z.string().min(1),
  EMAIL_SENDER_ADDRESS: z.email(),
});

export const env = envSchema.parse(process.env);
