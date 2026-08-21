import { Router } from 'express';
import { recordsController } from '../controllers/recordsController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Clinical records, medications, allergies, vaccinations, lab results
router.post('/consultations', requireRole(['PROVIDER', 'ADMIN']), recordsController.createMedicalRecord);
router.post('/medications', requireRole(['PROVIDER', 'ADMIN']), recordsController.createMedication);
router.post('/allergies', recordsController.createAllergy);
router.post('/vaccinations', requireRole(['PROVIDER', 'ADMIN']), recordsController.createVaccination);
router.post('/laboratories', requireRole(['PROVIDER', 'ADMIN']), recordsController.createLabResult);

export default router;
