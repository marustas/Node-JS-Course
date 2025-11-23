import type { RequestHandler } from 'express';
import type { ResponsePayload } from '../../models/ApiModels.ts';
import type { User } from '../../models/userModel.ts';

import UserModel from '../../models/userModel.ts';
import { catchAsync } from '../../utils/catchAsync.ts';
import jwt from 'jsonwebtoken';
import { env } from '../../envSchema.ts';
import { type StringValue } from 'ms';

interface SignUpResponsePayload extends ResponsePayload<User> {
  token: string;
}

const signUp: RequestHandler<null, SignUpResponsePayload, User> = async (req, res) => {
  const newUser = await UserModel.create(req.body);

  const token = jwt.sign({ id: newUser._id }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as StringValue,
  });

  res.status(201).json({
    status: 'success',
    data: newUser,
    token,
  });
};

export const authController = {
  //   login,
  signUp: catchAsync(signUp),
};
