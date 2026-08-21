import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import type { Clinic } from '../../types/index.js';

export const clinicController = {
  async getClinics(req: AuthenticatedRequest, res: Response) {
    const clinics = Array.from(db.clinics.values());
    res.json(clinics);
  },

  async getClinicById(req: AuthenticatedRequest, res: Response) {
    const { id } = req.params;
    const clinic = db.clinics.get(id);

    if (!clinic) {
      res.status(404).json({ error: 'Clinic not found.' });
      return;
    }

    res.json(clinic);
  },

  async createClinic(req: AuthenticatedRequest, res: Response) {
    if (!req.user || req.user.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only administrators can register new clinics.' });
      return;
    }

    const { name, address, phone, email, operatingHours } = req.body;
    if (!name || !address) {
      res.status(400).json({ error: 'Clinic name and address are required.' });
      return;
    }

    const now = new Date().toISOString();
    const newClinic: Clinic = {
      id: `clinic_${Date.now()}`,
      name,
      address,
      phone: phone || '',
      email: email || '',
      operatingHours: operatingHours || 'Mon-Fri: 8:00 AM - 5:00 PM',
      createdAt: now,
      updatedAt: now,
    };

    db.clinics.set(newClinic.id, newClinic);

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CLINIC_CREATED',
      resource: 'CLINICS',
      resourceId: newClinic.id,
      details: `New clinic added: ${newClinic.name}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json(newClinic);
  },
};
