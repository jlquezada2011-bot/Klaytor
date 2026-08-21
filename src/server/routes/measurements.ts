import { Router } from 'express';
import { measurementController } from '../controllers/measurementController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', measurementController.getMeasurements);
router.post('/', measurementController.createMeasurement);
router.get('/stats', measurementController.getStats);

export default router;
