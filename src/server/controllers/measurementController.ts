import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { measurementCreateSchema } from '../validators/index.js';
import type { HealthMeasurement } from '../../types/index.js';

export const measurementController = {
  async getMeasurements(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let targetPatientId: string | undefined;

    if (req.user.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.id);
      if (!patient) {
        res.status(404).json({ error: 'Patient profile not found.' });
        return;
      }
      targetPatientId = patient.id;
    } else if (req.user.role === 'PROVIDER' || req.user.role === 'ADMIN') {
      targetPatientId = req.query.patientId as string;
    }

    let measurements = Array.from(db.healthMeasurements.values());
    if (targetPatientId) {
      measurements = measurements.filter((m) => m.patientId === targetPatientId);
    }

    // Filter by type if requested
    const type = req.query.type as string;
    if (type) {
      measurements = measurements.filter((m) => m.measurementType === type);
    }

    // Sort descending by recorded date
    measurements.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

    res.json({
      disclaimer: 'Health measurements are for personal tracking purposes and should not be used as a substitute for professional medical advice or emergency diagnosis.',
      measurements,
    });
  },

  async createMeasurement(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const parsed = measurementCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    let patientId: string;
    if (req.user.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.id);
      if (!patient) {
        res.status(404).json({ error: 'Patient profile not found.' });
        return;
      }
      patientId = patient.id;
    } else {
      patientId = req.body.patientId;
      if (!patientId) {
        res.status(400).json({ error: 'Patient ID is required.' });
        return;
      }
    }

    const now = new Date().toISOString();
    const newMeasurement: HealthMeasurement = {
      id: `hm_${Date.now()}`,
      patientId,
      measurementType: parsed.data.measurementType,
      value: parsed.data.value,
      systolic: parsed.data.systolic,
      diastolic: parsed.data.diastolic,
      unit: parsed.data.unit,
      recordedAt: parsed.data.recordedAt || now,
      notes: parsed.data.notes,
      createdAt: now,
    };

    db.healthMeasurements.set(newMeasurement.id, newMeasurement);

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'HEALTH_MEASUREMENT_RECORDED',
      resource: 'HEALTH_MEASUREMENTS',
      resourceId: newMeasurement.id,
      details: `Recorded vital: ${newMeasurement.measurementType} (${newMeasurement.value} ${newMeasurement.unit})`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json({
      disclaimer: 'Health measurements are for personal tracking purposes only.',
      measurement: newMeasurement,
    });
  },

  async getStats(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let targetPatientId: string | undefined;
    if (req.user.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.id);
      if (!patient) {
        res.status(404).json({ error: 'Patient profile not found.' });
        return;
      }
      targetPatientId = patient.id;
    } else {
      targetPatientId = req.query.patientId as string;
    }

    if (!targetPatientId) {
      res.status(400).json({ error: 'Patient ID required.' });
      return;
    }

    const patientVitals = Array.from(db.healthMeasurements.values())
      .filter((m) => m.patientId === targetPatientId)
      .sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

    const latestBp = patientVitals.find((m) => m.measurementType === 'blood_pressure');
    const latestHr = patientVitals.find((m) => m.measurementType === 'heart_rate');
    const latestTemp = patientVitals.find((m) => m.measurementType === 'temperature');
    const latestWeight = patientVitals.find((m) => m.measurementType === 'weight');
    const latestSpo2 = patientVitals.find((m) => m.measurementType === 'spo2');

    res.json({
      latest: {
        bloodPressure: latestBp ? `${latestBp.systolic}/${latestBp.diastolic} ${latestBp.unit}` : 'None recorded',
        heartRate: latestHr ? `${latestHr.value} ${latestHr.unit}` : 'None recorded',
        temperature: latestTemp ? `${latestTemp.value} ${latestTemp.unit}` : 'None recorded',
        weight: latestWeight ? `${latestWeight.value} ${latestWeight.unit}` : 'None recorded',
        spo2: latestSpo2 ? `${latestSpo2.value} ${latestSpo2.unit}` : 'None recorded',
      },
      totalRecords: patientVitals.length,
      lastRecordedDate: patientVitals[0]?.recordedAt || null,
    });
  },
};
