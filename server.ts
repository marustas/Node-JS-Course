import mongoose from "mongoose";
import app from "./app.ts";

const PORT = process.env.PORT;
const DB_CONNECTION_STRING = process.env.DB_CONNECTION !== undefined ? process.env.DB_CONNECTION.replace('<DB_PASSWORD>', process.env.DB_PASSWORD ?? '') : '';

mongoose.connect(DB_CONNECTION_STRING, {
}).then(() => console.log('Database connected'))

app.listen(PORT, () => {
  console.log('Server is running on port ' + PORT);
});
