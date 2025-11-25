import type { RequestHandler } from 'express';
import { AppError, type ResponsePayload } from '../../models/ApiModels.ts';
import type { User } from '../../models/userModel.ts';

import UserModel from '../../models/userModel.ts';
import { catchAsync } from '../../utils/catchAsync.ts';
import jwt from 'jsonwebtoken';
import { env } from '../../envSchema.ts';
import { type StringValue } from 'ms';

interface AuthResponsePayload extends ResponsePayload<User> {
  token: string;
}

const signToken = <T>(userId: T) => {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });
};

const signUp: RequestHandler<null, AuthResponsePayload, User> = async (req, res) => {
  const newUser = await UserModel.create(req.body);

  const token = signToken(newUser._id);

  res.status(201).json({
    status: 'success',
    data: newUser,
    token,
  });
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

  const token = signToken(user._id);

  res.status(200).json({
    status: 'success',
    token,
  });
};

export const authController = {
  login: catchAsync(login),
  signUp: catchAsync(signUp),
};
