import type { RequestHandler } from 'express';
import { AppError, type ResponsePayload } from '../../models/ApiModels.ts';
import type { User } from '../../models/userModel.ts';

import UserModel from '../../models/userModel.ts';
import { catchAsync } from '../../utils/catchAsync.ts';
import jwt, { type JwtPayload } from 'jsonwebtoken';
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

const protect: RequestHandler<null> = async (req, res, next) => {
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

  next();
};

export const authController = {
  login: catchAsync(login),
  signUp: catchAsync(signUp),
  protect,
};
