import { Router } from 'express';
import { appointmentController } from '../controllers/appointmentController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

router.get('/', appointmentController.getAppointments);
router.post('/', appointmentController.createAppointment);
router.put('/:id', appointmentController.updateAppointment);
router.delete('/:id', appointmentController.deleteAppointment);

export default router;
