import { Router } from 'express';
import { authController } from '../controllers/auth/authController.ts';

const authRouter = Router();

authRouter.post('/signup', authController.signUp);
authRouter.post('/login', authController.login);
authRouter.post('/forgotPassword', authController.forgotPassword);
authRouter.patch('/resetPassword/:token', authController.resetPassword);
authRouter.patch('/updateMyPassword', authController.protect, authController.updatePassword);
authRouter.patch('/updateMe', authController.protect, authController.updateMe);

export default authRouter;
