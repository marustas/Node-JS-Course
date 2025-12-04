import { Router } from 'express';
import { authController } from '../controllers/auth/authController.ts';

const authRouter = Router();

authRouter.post('/signup', authController.signUp);
authRouter.post('/login', authController.login);
authRouter.post('/forgotPassword', authController.forgotPassword);
authRouter.patch('/resetPassword/:token', authController.resetPassword);
authRouter.patch('/updateMyPassword', authController.protect, authController.updatePassword);
authRouter.patch('/updateMe', authController.protect, authController.updateMe);
authRouter.delete('/deleteMe', authController.protect, authController.deleteMe);

authRouter.get('/me', authController.protect, authController.getMe, authController.getUser);

export default authRouter;
