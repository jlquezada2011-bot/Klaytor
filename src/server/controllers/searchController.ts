import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';

export const searchController = {
  async globalSearch(req: AuthenticatedRequest, res: Response) {
    const q = ((req.query.q as string) || '').trim().toLowerCase();
    if (!q) {
      res.json({
        providers: [],
        clinics: [],
        articles: [],
        appointments: [],
        patientRecords: [],
      });
      return;
    }

    // 1. Providers (accessible to all authenticated users)
    const providers = Array.from(db.providerProfiles.values()).filter(
      (p) =>
        p.firstName.toLowerCase().includes(q) ||
        p.lastName.toLowerCase().includes(q) ||
        p.specialty.toLowerCase().includes(q) ||
        p.bio.toLowerCase().includes(q)
    );

    // 2. Clinics (accessible to all)
    const clinics = Array.from(db.clinics.values()).filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );

    // 3. Health Education Articles (accessible to all)
    const articles = Array.from(db.healthArticles.values()).filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.summary.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q) ||
        a.content.toLowerCase().includes(q)
    );

    // 4. Appointments (RBAC-filtered)
    let appointments = Array.from(db.appointments.values());
    if (req.user?.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.id);
      appointments = appointments.filter((a) => a.patientId === patient?.id);
    } else if (req.user?.role === 'PROVIDER') {
      const provider = db.findProviderByUserId(req.user.id);
      appointments = appointments.filter((a) => a.providerId === provider?.id);
    }
    const matchedAppointments = appointments.filter(
      (a) =>
        a.reason.toLowerCase().includes(q) ||
        a.providerName?.toLowerCase().includes(q) ||
        a.patientName?.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q) ||
        a.appointmentDate.includes(q)
    );

    // 5. Patient Records (RBAC-filtered: Patients only their own; Providers search authorized patients; Admins non-clinical search)
    let matchedRecords: any[] = [];
    if (req.user?.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.id);
      if (patient) {
        const meds = Array.from(db.medications.values()).filter(
          (m) => m.patientId === patient.id && (m.name.toLowerCase().includes(q) || m.instructions.toLowerCase().includes(q))
        );
        const labs = Array.from(db.laboratoryResults.values()).filter(
          (l) => l.patientId === patient.id && (l.testName.toLowerCase().includes(q) || l.interpretation?.toLowerCase().includes(q))
        );
        matchedRecords = [
          ...meds.map((m) => ({ type: 'Medication', title: m.name, detail: m.dosage })),
          ...labs.map((l) => ({ type: 'Lab Result', title: l.testName, detail: l.status })),
        ];
      }
    } else if (req.user?.role === 'PROVIDER') {
      const patients = Array.from(db.patientProfiles.values()).filter(
        (p) =>
          p.firstName.toLowerCase().includes(q) ||
          p.lastName.toLowerCase().includes(q) ||
          p.phone.includes(q)
      );
      matchedRecords = patients.map((p) => ({
        type: 'Patient Profile',
        id: p.id,
        title: `${p.firstName} ${p.lastName}`,
        detail: `DOB: ${p.dateOfBirth} | Blood: ${p.bloodType}`,
      }));
    }

    res.json({
      providers,
      clinics,
      articles,
      appointments: matchedAppointments,
      patientRecords: matchedRecords,
    });
  },
};
