import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  role: z.enum(['PATIENT', 'PROVIDER', 'ADMIN']).default('PATIENT'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  bloodType: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  title: z.string().optional(),
  specialty: z.string().optional(),
  licenseNumber: z.string().optional(),
  clinicId: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export const resetPasswordSchema = z.object({
  email: z.string().email(),
  resetToken: z.string().min(1, 'Reset token required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

export const appointmentCreateSchema = z.object({
  providerId: z.string().min(1, 'Provider ID is required'),
  clinicId: z.string().min(1, 'Clinic ID is required'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  appointmentTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Time must be in HH:MM format'),
  reason: z.string().min(3, 'Reason must be at least 3 characters long'),
  notes: z.string().optional(),
});

export const appointmentUpdateSchema = z.object({
  status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled']),
  notes: z.string().optional(),
  appointmentDate: z.string().optional(),
  appointmentTime: z.string().optional(),
});

export const measurementCreateSchema = z.object({
  measurementType: z.enum(['temperature', 'blood_pressure', 'heart_rate', 'weight', 'spo2']),
  value: z.number().positive('Value must be positive'),
  systolic: z.number().positive().optional(),
  diastolic: z.number().positive().optional(),
  unit: z.string().min(1, 'Unit is required'),
  recordedAt: z.string().optional(),
  notes: z.string().optional(),
});

export const clinicalNoteCreateSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  visitDate: z.string().min(1, 'Visit date is required'),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  clinicalNotes: z.string().min(5, 'Clinical notes required'),
  treatmentPlan: z.string().min(5, 'Treatment plan required'),
});

export const medicationCreateSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  name: z.string().min(1, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  route: z.string().default('Oral'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  instructions: z.string().min(1, 'Instructions are required'),
  status: z.enum(['Active', 'Completed', 'Discontinued']).default('Active'),
});

export const allergyCreateSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  allergen: z.string().min(1, 'Allergen name is required'),
  reaction: z.string().min(1, 'Reaction description is required'),
  severity: z.enum(['Mild', 'Moderate', 'Severe']).default('Moderate'),
  diagnosedDate: z.string().min(1, 'Diagnosed date is required'),
});

export const vaccinationCreateSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  vaccineName: z.string().min(1, 'Vaccine name is required'),
  doseNumber: z.number().int().positive().default(1),
  administeredDate: z.string().min(1, 'Administered date is required'),
  administeredBy: z.string().min(1, 'Administered by is required'),
  batchNumber: z.string().min(1, 'Batch number is required'),
  nextDueDate: z.string().optional(),
});

export const labResultCreateSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  testName: z.string().min(1, 'Test name is required'),
  testCategory: z.string().min(1, 'Category is required'),
  testDate: z.string().min(1, 'Test date is required'),
  resultValue: z.string().min(1, 'Result value is required'),
  referenceRange: z.string().min(1, 'Reference range is required'),
  unit: z.string().min(1, 'Unit is required'),
  status: z.enum(['Normal', 'Abnormal', 'Critical', 'Pending']).default('Normal'),
  interpretation: z.string().optional(),
  fileName: z.string().optional(),
  fileUrl: z.string().optional(),
});

export const messageCreateSchema = z.object({
  receiverId: z.string().min(1, 'Receiver ID is required'),
  appointmentId: z.string().optional(),
  content: z.string().min(1, 'Message content cannot be empty'),
});

export const consentToggleSchema = z.object({
  consentType: z.string().min(1, 'Consent type is required'),
  granted: z.boolean(),
});
