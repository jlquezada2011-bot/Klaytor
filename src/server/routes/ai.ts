import { Router } from 'express';
import { aiController } from '../controllers/aiController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.post('/chat', aiController.chat);

export default router;
