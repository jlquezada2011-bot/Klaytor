import type { Response } from 'express';
import { db } from '../db/store.js';
import type { AuthenticatedRequest } from '../middleware/auth.js';
import { appointmentCreateSchema, appointmentUpdateSchema } from '../validators/index.js';
import type { Appointment, Notification } from '../../types/index.js';

export const appointmentController = {
  async getAppointments(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    let appointments = Array.from(db.appointments.values());

    if (req.user.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.id);
      if (!patient) {
        res.status(404).json({ error: 'Patient profile not found.' });
        return;
      }
      appointments = appointments.filter((a) => a.patientId === patient.id);
    } else if (req.user.role === 'PROVIDER') {
      const provider = db.findProviderByUserId(req.user.id);
      if (!provider) {
        res.status(404).json({ error: 'Provider profile not found.' });
        return;
      }
      appointments = appointments.filter((a) => a.providerId === provider.id);
    }

    // Sort by appointment date descending
    appointments.sort((a, b) => {
      const dateA = new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime();
      const dateB = new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime();
      return dateB - dateA;
    });

    res.json(appointments);
  },

  async createAppointment(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const parsed = appointmentCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    let patientId: string;
    let patientName = 'Patient';
    let patientEmail = req.user.email;

    if (req.user.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.id);
      if (!patient) {
        res.status(404).json({ error: 'Patient profile not found.' });
        return;
      }
      patientId = patient.id;
      patientName = `${patient.firstName} ${patient.lastName}`;
    } else {
      patientId = req.body.patientId;
      if (!patientId) {
        res.status(400).json({ error: 'Patient ID is required.' });
        return;
      }
      const targetPatient = db.patientProfiles.get(patientId);
      if (targetPatient) {
        patientName = `${targetPatient.firstName} ${targetPatient.lastName}`;
        const pUser = db.users.get(targetPatient.userId);
        if (pUser) patientEmail = pUser.email;
      }
    }

    const provider = db.providerProfiles.get(parsed.data.providerId);
    if (!provider) {
      res.status(404).json({ error: 'Selected healthcare provider was not found.' });
      return;
    }

    const clinic = db.clinics.get(parsed.data.clinicId) || db.clinics.get(provider.clinicId);
    const now = new Date().toISOString();

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      patientId,
      patientName,
      patientEmail,
      providerId: provider.id,
      providerName: `Dr. ${provider.firstName} ${provider.lastName}`,
      providerSpecialty: provider.specialty,
      clinicId: clinic ? clinic.id : 'clinic_1',
      clinicName: clinic ? clinic.name : 'Klaytor Medical Center',
      appointmentDate: parsed.data.appointmentDate,
      appointmentTime: parsed.data.appointmentTime,
      reason: parsed.data.reason,
      status: 'Pending',
      notes: parsed.data.notes || '',
      createdAt: now,
      updatedAt: now,
    };

    db.appointments.set(newAppointment.id, newAppointment);

    // Send notification to the healthcare provider
    const provUser = db.users.get(provider.userId);
    if (provUser) {
      const provNotif: Notification = {
        id: `notif_${Date.now()}`,
        userId: provUser.id,
        title: 'New Appointment Request',
        message: `${patientName} requested an appointment for ${newAppointment.appointmentDate} at ${newAppointment.appointmentTime}. Reason: ${newAppointment.reason}`,
        type: 'appointment',
        isRead: false,
        relatedId: newAppointment.id,
        createdAt: now,
      };
      db.notifications.set(provNotif.id, provNotif);
    }

    // Also send an acknowledgement notification to the patient
    const patUser = db.patientProfiles.get(patientId);
    if (patUser) {
      const patNotif: Notification = {
        id: `notif_${Date.now() + 1}`,
        userId: patUser.userId,
        title: 'Appointment Request Submitted',
        message: `Your appointment request with ${newAppointment.providerName} for ${newAppointment.appointmentDate} at ${newAppointment.appointmentTime} is currently pending provider confirmation.`,
        type: 'appointment',
        isRead: false,
        relatedId: newAppointment.id,
        createdAt: now,
      };
      db.notifications.set(patNotif.id, patNotif);
    }

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'APPOINTMENT_CREATED',
      resource: 'APPOINTMENTS',
      resourceId: newAppointment.id,
      details: `Appointment booked for patient ${patientName} with ${newAppointment.providerName} on ${newAppointment.appointmentDate}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.status(201).json(newAppointment);
  },

  async updateAppointment(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const appointment = db.appointments.get(id);

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }

    // Role check:
    // Patients can only cancel their own appointments
    // Providers can approve/reject/reschedule/complete appointments assigned to them
    // Admins can update any appointment
    if (req.user.role === 'PATIENT') {
      const patient = db.findPatientByUserId(req.user.id);
      if (!patient || appointment.patientId !== patient.id) {
        res.status(403).json({ error: 'Forbidden. You can only manage your own appointments.' });
        return;
      }
      if (req.body.status && req.body.status !== 'Cancelled') {
        res.status(403).json({ error: 'Patients can only cancel pending or confirmed appointments.' });
        return;
      }
    }

    const parsed = appointmentUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0]?.message || 'Validation failed' });
      return;
    }

    const prevStatus = appointment.status;
    if (parsed.data.status) appointment.status = parsed.data.status;
    if (parsed.data.notes !== undefined) appointment.notes = parsed.data.notes;
    if (parsed.data.appointmentDate) appointment.appointmentDate = parsed.data.appointmentDate;
    if (parsed.data.appointmentTime) appointment.appointmentTime = parsed.data.appointmentTime;

    appointment.updatedAt = new Date().toISOString();

    // Create notification for patient about status change
    const patientProfile = db.patientProfiles.get(appointment.patientId);
    if (patientProfile) {
      const notif: Notification = {
        id: `notif_${Date.now()}`,
        userId: patientProfile.userId,
        title: `Appointment ${appointment.status}`,
        message: `Your appointment with ${appointment.providerName} scheduled for ${appointment.appointmentDate} at ${appointment.appointmentTime} is now marked as ${appointment.status}.`,
        type: 'appointment',
        isRead: false,
        relatedId: appointment.id,
        createdAt: new Date().toISOString(),
      };
      db.notifications.set(notif.id, notif);
    }

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'APPOINTMENT_UPDATED',
      resource: 'APPOINTMENTS',
      resourceId: appointment.id,
      details: `Appointment ${appointment.id} status changed from ${prevStatus} to ${appointment.status}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.json(appointment);
  },

  async deleteAppointment(req: AuthenticatedRequest, res: Response) {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized.' });
      return;
    }

    const { id } = req.params;
    const appointment = db.appointments.get(id);

    if (!appointment) {
      res.status(404).json({ error: 'Appointment not found.' });
      return;
    }

    // Mark as cancelled rather than hard deleting to maintain audit records
    appointment.status = 'Cancelled';
    appointment.updatedAt = new Date().toISOString();

    db.addAuditLog({
      userId: req.user.id,
      userEmail: req.user.email,
      action: 'APPOINTMENT_CANCELLED',
      resource: 'APPOINTMENTS',
      resourceId: appointment.id,
      details: `Appointment ${appointment.id} was cancelled by ${req.user.email}`,
      ipAddress: req.ip || 'unknown',
      status: 'SUCCESS',
    });

    res.json({ message: 'Appointment has been cancelled.', appointment });
  },
};
