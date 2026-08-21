import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authenticateToken, authController.me);
router.post('/logout', authenticateToken, authController.logout);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

export default router;
