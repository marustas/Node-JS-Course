import { Router } from 'express';
import { authController } from '../controllers/auth/authController.ts';

const authRouter = Router();

authRouter.post('/signup', authController.signUp);

export default authRouter;
