import mongoose from 'mongoose';
import app from './app.ts';
import { env } from './envSchema.ts';

const PORT = env.PORT;
const DB_CONNECTION_STRING = env.DB_CONNECTION.replace('<DB_PASSWORD>', env.DB_PASSWORD ?? '');

mongoose.connect(DB_CONNECTION_STRING, {}).then(() => console.log('Database connected'));

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
