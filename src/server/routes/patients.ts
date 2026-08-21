import { Router } from 'express';
import { patientController } from '../controllers/patientController.js';
import { authenticateToken, requirePatientOrProviderAccess, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/me', patientController.getMe);
router.put('/me', patientController.updateMe);
router.get('/me/records', patientController.getPatientRecords);
router.get('/all', requireRole(['PROVIDER', 'ADMIN']), patientController.getAllPatients);
router.get('/:patientId/records', requirePatientOrProviderAccess, patientController.getPatientRecords);

export default router;
