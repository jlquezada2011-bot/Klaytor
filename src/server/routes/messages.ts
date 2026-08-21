import { Router } from 'express';
import { messageController } from '../controllers/messageController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', messageController.getMessages);
router.post('/send', messageController.sendMessage);

export default router;
