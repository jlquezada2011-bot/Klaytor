import { Router } from 'express';
import { consentController } from '../controllers/consentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', consentController.getConsent);
router.post('/toggle', consentController.toggleConsent);

export default router;
