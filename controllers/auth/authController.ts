import type { RequestHandler } from 'express';
import type { ResponsePayload } from '../../models/ApiModels.ts';
import type { User } from '../../models/userModel.ts';

import UserModel from '../../models/userModel.ts';
import { catchAsync } from '../../utils/catchAsync.ts';

const signUp: RequestHandler<null, ResponsePayload<User>, User> = async (req, res) => {
  const newUser = await UserModel.create(req.body);

  res.status(201).json({
    status: 'success',
    data: newUser,
  });
};

export const authController = {
  //   login,
  signUp: catchAsync(signUp),
};
