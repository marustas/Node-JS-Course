import type { RequestHandler } from 'express';

import crypto from 'crypto';

import type { Response } from 'express';
import type { HydratedDocument } from 'mongoose';

import jwt, { type JwtPayload } from 'jsonwebtoken';
import { type ResponsePayload, AppError } from '../models/ApiModels.ts';
import UserModel, { UserRole, type User } from '../models/userModel.ts';
import { catchAsync } from '../utils/catchAsync.ts';
import { sendEmail } from '../utils/email.ts';
import { type StringValue } from 'ms';
import { env } from '../envSchema.ts';

interface AuthResponsePayload extends ResponsePayload<User> {
  token: string;
}

const signToken = <T>(userId: T) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });
};

const createSendToken = (
  user: HydratedDocument<User>,
  statusCode: number,
  res: Response<AuthResponsePayload>
) => {
  const token = signToken(user._id);

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + (env.JWT_COOKIE_EXPIRES_IN as number) * 24 * 60 * 60 * 1000), // days to milliseconds
    httpOnly: true,
    secure: env.ENVIRONMENT === 'production',
  });

  res.status(statusCode).json({
    status: 'success',
    data: user,
    token,
  });
};

const signUp: RequestHandler<null, AuthResponsePayload, User> = async (req, res) => {
  const newUser = await UserModel.create(req.body);

  createSendToken(newUser, 201, res);
};

const login: RequestHandler<null, AuthResponsePayload, User> = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  const user = await UserModel.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  createSendToken(user, 200, res);
};

const forgotPassword: RequestHandler<null, ResponsePayload<{ message: string }>, User> = async (
  req,
  res,
  next
) => {
  const user = await UserModel.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError('There is no user with that email address.', 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetPassword/${resetToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Token',
      text: `Follow this url to reset password: ${resetUrl}`,
    });
  } catch {
    user.resetPasswordResetToken();

    await user.save({ validateBeforeSave: false });

    return next(new AppError('Error sending email', 500));
  }

  res.status(200).json({
    status: 'success',
    message: 'Token sent to email!',
  });
};

const resetPassword: RequestHandler<
  { token: string },
  ResponsePayload<{ message: string }>,
  User
> = async (req, res, next) => {
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await UserModel.findOne({
    passwordResetToken: hashedToken,
    resetTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Token is invalid or has expired', 400));
  }

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;

  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Password reset successful!',
  });
};

const protect: RequestHandler = async (req, res, next) => {
  const { headers } = req;

  const token = headers.authorization?.split(' ')[1];
  if (!token) {
    return next(new AppError('You are not logged in! Please log in to get access.', 401));
  }

  const decodedTokenPayload = await new Promise<JwtPayload>((resolve, reject) => {
    jwt.verify(token, env.JWT_SECRET, (err, decoded) => {
      if (err || !decoded || typeof decoded === 'string') {
        return reject(new AppError('Invalid token', 401));
      }
      resolve(decoded);
    });
  });

  const currentUser = await UserModel.findById(decodedTokenPayload.id);
  if (!currentUser) {
    return next(new AppError('The user belonging to this token does no longer exist.', 401));
  }

  req.user = currentUser;
  next();
};

const restrictTo = <TParams, TRes, TReq, TQuery>(
  ...roles: UserRole[]
): RequestHandler<TParams, TRes, TReq, TQuery> => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

const updatePassword: RequestHandler<unknown, AuthResponsePayload, User> = async (
  req,
  res,
  next
) => {
  const { password: newPassword } = req.body;

  if (!newPassword) {
    return next(new AppError('Please provide new password', 400));
  }

  const user = await UserModel.findById(req.user._id).select('+password');

  if (!user || !(await user.correctPassword(newPassword, user.password))) {
    return next(new AppError('Your current password is wrong', 401));
  }

  user.password = newPassword;
  await user.save();

  createSendToken(user, 200, res);
};

const updateMe: RequestHandler<
  unknown,
  ResponsePayload<User>,
  Partial<Omit<User, 'password' | 'role'>>
> = async (req, res, next) => {
  if ('password' in req.body || 'role' in req.body) {
    return next(new AppError('This route is not for password or role updates', 400));
  }

  const user = await UserModel.findByIdAndUpdate(req.user._id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
};

const deleteMe: RequestHandler<unknown, ResponsePayload<null>, User> = async (req, res) => {
  await UserModel.findByIdAndUpdate(req.user._id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null,
  });
};

const getMe: RequestHandler<{ id?: string }, ResponsePayload<User>, User> = async (
  req,
  res,
  next
) => {
  req.params.id = req.user._id;
  next();
};

const getUser: RequestHandler<{ id: string }, ResponsePayload<User>, User> = async (
  req,
  res,
  next
) => {
  const user = await UserModel.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
};

export const authController = {
  login: catchAsync(login),
  signUp: catchAsync(signUp),
  forgotPassword,
  resetPassword,
  updatePassword: catchAsync(updatePassword),
  updateMe: catchAsync(updateMe),
  deleteMe: catchAsync(deleteMe),
  getMe,
  getUser: catchAsync(getUser),
  protect,
  restrictTo,
};
