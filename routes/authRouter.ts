import { Router } from 'express';
import { authController } from '../controllers/authController.ts';
import { z } from 'zod';

import { validateBody } from '../utils/validateRequestBody.ts';

const updateMeBodySchema = z
  .object({
    name: z.string(),
    email: z.string(),
    photo: z.string(),
  })
  .partial()
  .strict();

const authRouter = Router();

authRouter.post('/signup', authController.signUp);
authRouter.post('/login', authController.login);

authRouter.use(authController.protect);

authRouter.post('/forgotPassword', authController.forgotPassword);
authRouter.patch('/resetPassword/:token', authController.resetPassword);
authRouter.patch('/updateMyPassword', authController.updatePassword);
authRouter.patch('/updateMe', validateBody(updateMeBodySchema), authController.updateMe);
authRouter.delete('/deleteMe', authController.deleteMe);

authRouter.get('/me', authController.getMe, authController.getUser);

export default authRouter;
