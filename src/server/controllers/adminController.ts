import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { SystemStats } from '../../types/index.js';

export const adminController = {
  async getStats(req: AuthenticatedRequest, res: Response) {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Administrator permissions required.' });
      return;
    }

    const appointments = Array.from(db.appointments.values());
    const stats: SystemStats = {
      totalPatients: db.patientProfiles.size,
      totalProviders: db.providerProfiles.size,
      totalClinics: db.clinics.size,
      totalAppointments: appointments.length,
      pendingAppointments: appointments.filter((a) => a.status === 'Pending').length,
      auditLogsCount: db.auditLogs.length,
    };

    res.json(stats);
  },

  async getUsers(req: AuthenticatedRequest, res: Response) {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Administrator permissions required.' });
      return;
    }

    const roleFilter = req.query.role as string;
    let users = Array.from(db.users.values()).map((u) => {
      const safe = db.sanitizeUser(u);
      let profileDetails = '';
      if (u.role === 'PATIENT') {
        const p = db.findPatientByUserId(u.id);
        if (p) profileDetails = `${p.firstName} ${p.lastName} (${p.phone || 'No phone'})`;
      } else if (u.role === 'PROVIDER') {
        const p = db.findProviderByUserId(u.id);
        if (p) profileDetails = `Dr. ${p.firstName} ${p.lastName} - ${p.specialty}`;
      }
      return {
        ...safe,
        profileDetails,
      };
    });

    if (roleFilter && roleFilter !== 'ALL') {
      users = users.filter((u) => u.role === roleFilter);
    }

    res.json(users);
  },

  async toggleUserStatus(req: AuthenticatedRequest, res: Response) {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Administrator permissions required.' });
      return;
    }

    const { id } = req.params;
    const targetUser = db.users.get(id);

    if (!targetUser) {
      res.status(404).json({ error: 'User not found.' });
      return;
    }

    targetUser.isActive = !targetUser.isActive;
    targetUser.updatedAt = new Date().toISOString();

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'USER_STATUS_TOGGLED',
      resource: 'USERS',
      resourceId: targetUser.id,
      details: `Administrator toggled active status of ${targetUser.email} to ${targetUser.isActive ? 'ACTIVE' : 'DEACTIVATED'}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.json({
      message: `User ${targetUser.email} is now ${targetUser.isActive ? 'active' : 'deactivated'}.`,
      user: db.sanitizeUser(targetUser),
    });
  },

  async getAuditLogs(req: AuthenticatedRequest, res: Response) {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Administrator permissions required to view audit logs.' });
      return;
    }

    const action = req.query.action as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    let logs = [...db.auditLogs];

    if (action) {
      logs = logs.filter((l) => l.action.toLowerCase().includes(action.toLowerCase()));
    }
    if (status) {
      logs = logs.filter((l) => l.status === status);
    }
    if (search) {
      const q = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.details.toLowerCase().includes(q) ||
          (l.userEmail && l.userEmail.toLowerCase().includes(q)) ||
          l.resource.toLowerCase().includes(q)
      );
    }

    res.json(logs);
  },
};
