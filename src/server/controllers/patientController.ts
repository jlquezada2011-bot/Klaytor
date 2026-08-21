import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const patientController = {
  async getMe(req: AuthenticatedRequest, res: Response) {
    if (!req.user || req.user.role !== 'PATIENT') {
      res.status(403).json({ error: 'Only patients can access their patient profile directly.' });
      return;
    }

    const profile = db.findPatientByUserId(req.user.id);
    if (!profile) {
      res.status(404).json({ error: 'Patient profile not found.' });
      return;
    }

    res.json(profile);
  },

  async updateMe(req: AuthenticatedRequest, res: Response) {
    if (!req.user || req.user.role !== 'PATIENT') {
      res.status(403).json({ error: 'Only patients can update their patient profile.' });
      return;
    }

    const profile = db.findPatientByUserId(req.user.id);
    if (!profile) {
      res.status(404).json({ error: 'Patient profile not found.' });
      return;
    }

    const {
      firstName,
      lastName,
      dateOfBirth,
      gender,
      bloodType,
      phone,
      address,
      emergencyContactName,
      emergencyContactPhone,
    } = req.body;

    if (firstName) profile.firstName = firstName;
    if (lastName) profile.lastName = lastName;
    if (dateOfBirth) profile.dateOfBirth = dateOfBirth;
    if (gender) profile.gender = gender;
    if (bloodType) profile.bloodType = bloodType;
    if (phone !== undefined) profile.phone = phone;
    if (address !== undefined) profile.address = address;
    if (emergencyContactName !== undefined) profile.emergencyContactName = emergencyContactName;
    if (emergencyContactPhone !== undefined) profile.emergencyContactPhone = emergencyContactPhone;

    profile.updatedAt = new Date().toISOString();

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'PATIENT_PROFILE_UPDATED',
      resource: 'PATIENT_PROFILE',
      resourceId: profile.id,
      details: 'Patient updated their personal contact and profile information',
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.json(profile);
  },

  async getPatientRecords(req: AuthenticatedRequest, res: Response) {
    let patientId: string | undefined;

    if (req.user?.role === 'PATIENT') {
      const profile = db.findPatientByUserId(req.user.id);
      if (!profile) {
        res.status(404).json({ error: 'Patient profile not found.' });
        return;
      }
      patientId = req.params.patientId || profile.id;
    } else if (req.user?.role === 'PROVIDER' || req.user?.role === 'ADMIN') {
      patientId = req.params.patientId || (req.query.patientId as string);
    }

    if (!patientId) {
      res.status(400).json({ error: 'Patient ID is required.' });
      return;
    }

    const patientProfile = db.patientProfiles.get(patientId);
    if (!patientProfile) {
      res.status(404).json({ error: 'Patient not found.' });
      return;
    }

    // Security check: If another patient tries to access this record, reject
    if (req.user?.role === 'PATIENT') {
      const myProfile = db.findPatientByUserId(req.user.id);
      if (myProfile?.id !== patientId) {
        db.addAuditLog({
          userId: req.user.id,
          userEmail: req.user.email,
          action: 'CROSS_PATIENT_ACCESS_BLOCKED',
          resource: 'MEDICAL_RECORDS',
          resourceId: patientId,
          details: `Unauthorized attempt by patient ${myProfile?.id} to access records of patient ${patientId}`,
          ipAddress: req.ip || 'unknown',
          status: 'BLOCKED',
        });
        res.status(403).json({ error: 'Forbidden. You cannot access another patient\'s records.' });
        return;
      }
    }

    // Retrieve all associated health records
    const medicalRecords = Array.from(db.medicalRecords.values()).filter((r) => r.patientId === patientId);
    const medications = Array.from(db.medications.values()).filter((m) => m.patientId === patientId);
    const allergies = Array.from(db.allergies.values()).filter((a) => a.patientId === patientId);
    const vaccinations = Array.from(db.vaccinations.values()).filter((v) => v.patientId === patientId);
    const laboratoryResults = Array.from(db.laboratoryResults.values()).filter((l) => l.patientId === patientId);
    const healthMeasurements = Array.from(db.healthMeasurements.values())
      .filter((h) => h.patientId === patientId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
    const appointments = Array.from(db.appointments.values()).filter((a) => a.patientId === patientId);

    // Audit log this access
    db.addAuditLog({
      userId: req.user?.id,
      userEmail: req.user?.email,
      action: 'PATIENT_RECORD_VIEWED',
      resource: 'MEDICAL_RECORDS',
      resourceId: patientId,
      details: `${req.user?.role} ${req.user?.email} viewed health record chart for patient ${patientProfile.firstName} ${patientProfile.lastName}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.json({
      patient: patientProfile,
      medicalRecords,
      medications,
      allergies,
      vaccinations,
      laboratoryResults,
      healthMeasurements,
      appointments,
    });
  },

  async getAllPatients(req: AuthenticatedRequest, res: Response) {
    if (req.user?.role !== 'PROVIDER' && req.user?.role !== 'ADMIN') {
      res.status(403).json({ error: 'Only healthcare providers and administrators can list patients.' });
      return;
    }

    const patients = Array.from(db.patientProfiles.values());
    res.json(patients);
  },
};
