import { Router } from 'express';
import { authController } from '../controllers/authController.ts';

const authRouter = Router();

authRouter.post('/signup', authController.signUp);
authRouter.post('/login', authController.login);

authRouter.use(authController.protect);

authRouter.post('/forgotPassword', authController.forgotPassword);
authRouter.patch('/resetPassword/:token', authController.resetPassword);
authRouter.patch('/updateMyPassword', authController.updatePassword);
authRouter.patch('/updateMe', authController.updateMe);
authRouter.delete('/deleteMe', authController.deleteMe);

authRouter.get('/me', authController.getMe, authController.getUser);

export default authRouter;
