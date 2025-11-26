import { Document, model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  GUIDE = 'guide',
  LEAD_GUIDE = 'lead-guide',
  ADMIN = 'admin',
}
export interface User {
  email: string;
  password: string;
  name: string;
  photo?: string;
  role: UserRole;
}

export interface UserDocument extends User, Document {
  confirmPassword?: string; // virtual field
  _confirmPassword?: string; // internal storage
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      unique: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
      select: true,
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minLength: [8, 'Password must be at least 8 characters long'],
      maxlength: [12, 'Password must be at most 12 characters long'],
      select: false,
    },
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
    },
    photo: String,
    role: {
      type: String,
      enum: ['user', 'guide', 'lead-guide', 'admin'],
      default: UserRole.USER,
    },
  },
  {
    methods: {
      correctPassword: async (candidatePassword: string, userPassword: string) => {
        return await bcrypt.compare(candidatePassword, userPassword);
      },
    },
  }
);

userSchema
  .virtual('confirmPassword')
  .set(function (this: UserDocument, value: string) {
    this._confirmPassword = value;
  })
  .get(function (this: UserDocument) {
    return this._confirmPassword;
  });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

const UserModel = model<UserDocument>('User', userSchema);

export default UserModel;
