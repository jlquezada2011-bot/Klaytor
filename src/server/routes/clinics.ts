import { Router } from 'express';
import { clinicController } from '../controllers/clinicController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', clinicController.getClinics);
router.get('/:id', clinicController.getClinicById);
router.post('/', clinicController.createClinic);

export default router;
