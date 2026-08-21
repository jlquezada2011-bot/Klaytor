import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);
router.get('/audit-logs', adminController.getAuditLogs);

export default router;
