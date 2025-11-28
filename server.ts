import mongoose from 'mongoose';
import app from './app.ts';
import { env } from './envSchema.ts';

process.on('unhandledRejection', (err: Error) => {
  console.error('UNHANDLED REJECTION!');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

// MUST EXIT BECAUSE NODE PROCESS IS IN UNSTABLE STATE
process.on('uncaughtException', (err: Error) => {
  console.error('UNCAUGHT EXCEPTION!');
  console.error(err.name, err.message);
  server.close(() => process.exit(1));
});

const PORT = env.PORT;
const DB_CONNECTION_STRING = env.DB_CONNECTION.replace('<DB_PASSWORD>', env.DB_PASSWORD ?? '');

mongoose.connect(DB_CONNECTION_STRING, {}).then(() => console.log('Database connected'));

const server = app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
