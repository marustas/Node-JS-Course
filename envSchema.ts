import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  DB_CONNECTION: z.string().min(1),
  DB_PASSWORD: z.string().min(1),
});

export const env = envSchema.parse(process.env);
