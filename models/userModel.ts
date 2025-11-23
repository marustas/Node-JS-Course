import { Document, model, Schema } from 'mongoose';

export interface User {
  email: string;
  password: string;
  name: string;
  photo?: string;
}

export interface UserDocument extends User, Document {
  confirmPassword?: string; // virtual field
  _confirmPassword?: string; // internal storage
}

const userSchema = new Schema<UserDocument>({
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
});

userSchema
  .virtual('confirmPassword')
  .set(function (this: UserDocument, value: string) {
    this._confirmPassword = value;
  })
  .get(function (this: UserDocument) {
    return this._confirmPassword;
  });

userSchema.pre('save', function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  next();
});

const UserModel = model<User>('User', userSchema);

export default UserModel;
