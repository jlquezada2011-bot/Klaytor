export type UserRole = 'PATIENT' | 'PROVIDER' | 'ADMIN';

export type AppointmentStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled' | 'Rescheduled';

export type MeasurementType = 'temperature' | 'blood_pressure' | 'heart_rate' | 'weight' | 'spo2';

export type LabStatus = 'Normal' | 'Abnormal' | 'Critical' | 'Pending';

export type NotificationType = 'appointment' | 'result' | 'message' | 'reminder' | 'system';

export type ArticleCategory =
  | 'Nutrition'
  | 'Exercise'
  | 'Hygiene'
  | 'Preventive care'
  | 'Vaccination'
  | 'Mental well-being'
  | 'First aid'
  | 'Common health information';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  bloodType: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProviderProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  licenseNumber: string;
  clinicId: string;
  clinicName?: string;
  bio: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
}

export interface Clinic {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  operatingHours: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName?: string;
  patientEmail?: string;
  providerId: string;
  providerName?: string;
  providerSpecialty?: string;
  clinicId: string;
  clinicName?: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  providerId: string;
  providerName?: string;
  visitDate: string;
  diagnosis: string;
  clinicalNotes: string;
  treatmentPlan: string;
  createdAt: string;
  updatedAt: string;
}

export interface Medication {
  id: string;
  patientId: string;
  providerId: string;
  providerName?: string;
  name: string;
  dosage: string;
  frequency: string;
  route: string;
  startDate: string;
  endDate?: string;
  instructions: string;
  status: 'Active' | 'Completed' | 'Discontinued';
  createdAt: string;
  updatedAt: string;
}

export interface Allergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  diagnosedDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Vaccination {
  id: string;
  patientId: string;
  vaccineName: string;
  doseNumber: number;
  administeredDate: string;
  administeredBy: string;
  batchNumber: string;
  nextDueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LaboratoryResult {
  id: string;
  patientId: string;
  providerId: string;
  providerName?: string;
  testName: string;
  testCategory: string;
  testDate: string;
  resultValue: string;
  referenceRange: string;
  unit: string;
  status: LabStatus;
  interpretation?: string;
  fileName?: string;
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthMeasurement {
  id: string;
  patientId: string;
  measurementType: MeasurementType;
  value: number;
  systolic?: number;
  diastolic?: number;
  unit: string;
  recordedAt: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  relatedId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  senderName?: string;
  senderRole?: UserRole;
  receiverId: string;
  receiverName?: string;
  appointmentId?: string;
  content: string;
  isRead: boolean;
  createdAt: string;
}

export interface HealthArticle {
  id: string;
  title: string;
  category: ArticleCategory;
  summary: string;
  content: string;
  readTime: string;
  author: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConsentRecord {
  id: string;
  userId: string;
  consentType: string;
  description: string;
  granted: boolean;
  termsVersion: string;
  ipAddress?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  userId?: string;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: string;
  ipAddress: string;
  status: 'SUCCESS' | 'FAILURE' | 'BLOCKED';
  timestamp: string;
}

export interface AuthResponse {
  user: User;
  profile: PatientProfile | ProviderProfile | null;
  token: string;
}

export interface SystemStats {
  totalPatients: number;
  totalProviders: number;
  totalClinics: number;
  totalAppointments: number;
  pendingAppointments: number;
  auditLogsCount: number;
}
