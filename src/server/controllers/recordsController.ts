import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import {
  clinicalNoteCreateSchema,
  medicationCreateSchema,
  allergyCreateSchema,
  vaccinationCreateSchema,
  labResultCreateSchema,
} from '../validators/index.js';
import type {
  MedicalRecord,
  Medication,
  Allergy,
  Vaccination,
  LaboratoryResult,
  Notification,
} from '../../types/index.js';

export const recordsController = {
  // Clinical Notes
  async createMedicalRecord(req: AuthenticatedRequest, res: Response) {
    if (!req.user || (req.user.role !== 'PROVIDER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ error: 'Only healthcare providers can create clinical consultation records.' });
      return;
    }

    const parsed = clinicalNoteCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const provider = db.findProviderByUserId(req.user.id);
    const providerName = provider ? `Dr. ${provider.firstName} ${provider.lastName}` : 'Attending Physician';
    const now = new Date().toISOString();

    const newRecord: MedicalRecord = {
      id: `mr_${Date.now()}`,
      patientId: parsed.data.patientId,
      providerId: provider?.id || 'prov_unknown',
      providerName,
      visitDate: parsed.data.visitDate,
      diagnosis: parsed.data.diagnosis,
      clinicalNotes: parsed.data.clinicalNotes,
      treatmentPlan: parsed.data.treatmentPlan,
      createdAt: now,
      updatedAt: now,
    };

    db.medicalRecords.set(newRecord.id, newRecord);

    // Notify patient
    const patient = db.patientProfiles.get(parsed.data.patientId);
    if (patient) {
      const notif: Notification = {
        id: `notif_${Date.now()}`,
        userId: patient.userId,
        title: 'New Clinical Consultation Note Added',
        message: `${providerName} has added clinical notes for your visit on ${newRecord.visitDate}.`,
        type: 'result',
        isRead: false,
        relatedId: newRecord.id,
        createdAt: now,
      };
      db.notifications.set(notif.id, notif);
    }

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'CLINICAL_RECORD_CREATED',
      resource: 'MEDICAL_RECORDS',
      resourceId: newRecord.id,
      details: `Provider ${providerName} created clinical note for patient ${parsed.data.patientId}: ${newRecord.diagnosis}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json(newRecord);
  },

  // Medications
  async createMedication(req: AuthenticatedRequest, res: Response) {
    if (!req.user || (req.user.role !== 'PROVIDER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ error: 'Only healthcare providers can prescribe or add medications.' });
      return;
    }

    const parsed = medicationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const provider = db.findProviderByUserId(req.user.id);
    const providerName = provider ? `Dr. ${provider.firstName} ${provider.lastName}` : 'Prescribing Physician';
    const now = new Date().toISOString();

    const newMed: Medication = {
      id: `med_${Date.now()}`,
      patientId: parsed.data.patientId,
      providerId: provider?.id || 'prov_unknown',
      providerName,
      name: parsed.data.name,
      dosage: parsed.data.dosage,
      frequency: parsed.data.frequency,
      route: parsed.data.route,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      instructions: parsed.data.instructions,
      status: parsed.data.status,
      createdAt: now,
      updatedAt: now,
    };

    db.medications.set(newMed.id, newMed);

    // Notify patient
    const patient = db.patientProfiles.get(parsed.data.patientId);
    if (patient) {
      const notif: Notification = {
        id: `notif_${Date.now()}`,
        userId: patient.userId,
        title: 'New Medication Prescribed',
        message: `${providerName} prescribed ${newMed.name} (${newMed.dosage}, ${newMed.frequency}).`,
        type: 'reminder',
        isRead: false,
        relatedId: newMed.id,
        createdAt: now,
      };
      db.notifications.set(notif.id, notif);
    }

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'MEDICATION_PRESCRIBED',
      resource: 'MEDICATIONS',
      resourceId: newMed.id,
      details: `Prescribed ${newMed.name} ${newMed.dosage} for patient ${parsed.data.patientId}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json(newMed);
  },

  // Allergies
  async createAllergy(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const parsed = allergyCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const now = new Date().toISOString();
    const newAllergy: Allergy = {
      id: `alg_${Date.now()}`,
      patientId: parsed.data.patientId,
      allergen: parsed.data.allergen,
      reaction: parsed.data.reaction,
      severity: parsed.data.severity,
      diagnosedDate: parsed.data.diagnosedDate,
      createdAt: now,
      updatedAt: now,
    };

    db.allergies.set(newAllergy.id, newAllergy);

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'ALLERGY_RECORDED',
      resource: 'ALLERGIES',
      resourceId: newAllergy.id,
      details: `Allergy recorded: ${newAllergy.allergen} (${newAllergy.severity}) for patient ${parsed.data.patientId}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json(newAllergy);
  },

  // Vaccinations
  async createVaccination(req: AuthenticatedRequest, res: Response) {
    if (!req.user || (req.user.role !== 'PROVIDER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ error: 'Only healthcare personnel can record immunizations.' });
      return;
    }

    const parsed = vaccinationCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const now = new Date().toISOString();
    const newVac: Vaccination = {
      id: `vac_${Date.now()}`,
      patientId: parsed.data.patientId,
      vaccineName: parsed.data.vaccineName,
      doseNumber: parsed.data.doseNumber,
      administeredDate: parsed.data.administeredDate,
      administeredBy: parsed.data.administeredBy,
      batchNumber: parsed.data.batchNumber,
      nextDueDate: parsed.data.nextDueDate,
      createdAt: now,
      updatedAt: now,
    };

    db.vaccinations.set(newVac.id, newVac);

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'VACCINATION_RECORDED',
      resource: 'VACCINATIONS',
      resourceId: newVac.id,
      details: `Vaccination logged: ${newVac.vaccineName} dose #${newVac.doseNumber} for patient ${parsed.data.patientId}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json(newVac);
  },

  // Laboratory Results
  async createLabResult(req: AuthenticatedRequest, res: Response) {
    if (!req.user || (req.user.role !== 'PROVIDER' && req.user.role !== 'ADMIN')) {
      res.status(403).json({ error: 'Only authorized healthcare staff can post laboratory results.' });
      return;
    }

    const parsed = labResultCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const provider = db.findProviderByUserId(req.user.id);
    const providerName = provider ? `Dr. ${provider.firstName} ${provider.lastName}` : 'Laboratory Staff';
    const now = new Date().toISOString();

    const newLab: LaboratoryResult = {
      id: `lab_${Date.now()}`,
      patientId: parsed.data.patientId,
      providerId: provider?.id || 'prov_lab',
      providerName,
      testName: parsed.data.testName,
      testCategory: parsed.data.testCategory,
      testDate: parsed.data.testDate,
      resultValue: parsed.data.resultValue,
      referenceRange: parsed.data.referenceRange,
      unit: parsed.data.unit,
      status: parsed.data.status,
      interpretation: parsed.data.interpretation,
      fileName: parsed.data.fileName || `${parsed.data.testName.replace(/\s+/g, '_')}_Report.pdf`,
      fileUrl: parsed.data.fileUrl || '/uploads/labs/sample_report.pdf',
      createdAt: now,
      updatedAt: now,
    };

    db.laboratoryResults.set(newLab.id, newLab);

    // Notify patient of new lab result
    const patient = db.patientProfiles.get(parsed.data.patientId);
    if (patient) {
      const notif: Notification = {
        id: `notif_${Date.now()}`,
        userId: patient.userId,
        title: 'New Laboratory Result Available',
        message: `Your test result for "${newLab.testName}" has been uploaded by ${providerName}. Status: ${newLab.status}`,
        type: 'result',
        isRead: false,
        relatedId: newLab.id,
        createdAt: now,
      };
      db.notifications.set(notif.id, notif);
    }

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'LAB_RESULT_UPLOADED',
      resource: 'LABORATORY_RESULTS',
      resourceId: newLab.id,
      details: `Laboratory result uploaded: ${newLab.testName} (${newLab.status}) for patient ${parsed.data.patientId}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json(newLab);
  },
};
