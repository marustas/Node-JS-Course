import { model, Schema, type InferSchemaType } from 'mongoose';

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'A user must have an email'],
    unique: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'A user must have a password'],
    minLength: [8, 'Password must be at least 8 characters long'],
    maxlength: [12, 'Password must be at most 12 characters long'],
  },
  name: {
    type: String,
    required: [true, 'A user must have a name'],
    trim: true,
  },
  photo: String,
  confirmPassword: {
    type: String,
    required: [true, 'Please confirm your password'],
  },
});

type User = InferSchemaType<typeof userSchema>;

const UserModel = model<User>('User', userSchema);

export default UserModel;
