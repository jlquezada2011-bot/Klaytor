import { Router } from 'express';
import { providerController } from '../controllers/providerController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', providerController.getProviders);
router.get('/:id', providerController.getProviderById);

export default router;
