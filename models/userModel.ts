import { model, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

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
  passwordResetToken?: string;
  resetTokenExpires?: number;
  _confirmPassword?: string; // internal storage
}

interface UserVirtuals {
  confirmPassword?: string; // virtual field
}

interface UserModelMethods {
  correctPassword(candidatePassword: string, userPassword: string): Promise<boolean>;
  createPasswordResetToken(): string;
  resetPasswordResetToken(): void;
}

const userSchema = new Schema<User, unknown, UserModelMethods, object, UserVirtuals>(
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
    passwordResetToken: {
      type: String,
      select: false,
    },
    resetTokenExpires: {
      type: Date,
      select: false,
    },
  },
  {
    methods: {
      correctPassword: async (candidatePassword: string, userPassword: string) => {
        return await bcrypt.compare(candidatePassword, userPassword);
      },
      createPasswordResetToken: function () {
        const resetToken = crypto.randomBytes(32).toString('hex');

        this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        this.resetTokenExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        return resetToken;
      },
      resetPasswordResetToken: function () {
        this.passwordResetToken = undefined;
        this.resetTokenExpires = undefined;
      },
    },
    virtuals: {
      confirmPassword: {
        get: function () {
          return this._confirmPassword;
        },
        set: function (value: string | undefined) {
          this._confirmPassword = value;
        },
      },
    },
  }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);

  next();
});

const UserModel = model('User', userSchema);

export default UserModel;
