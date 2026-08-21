import type {
  User,
  PatientProfile,
  ProviderProfile,
  Clinic,
  Appointment,
  MedicalRecord,
  Medication,
  Allergy,
  Vaccination,
  LaboratoryResult,
  HealthMeasurement,
  Notification,
  Message,
  HealthArticle,
  ConsentRecord,
  AuditLog,
  SystemStats,
  AuthResponse,
} from '../types/index.js';

class ApiService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('klaytor_token');
    }
  }

  public setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('klaytor_token', token);
      } else {
        localStorage.removeItem('klaytor_token');
      }
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const res = await fetch(endpoint, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || `Request failed with status ${res.status}`);
    }

    return data as T;
  }

  // Auth
  async login(credentials: { email: string; password: string }): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    this.setToken(res.token);
    return res;
  }

  async register(data: any): Promise<AuthResponse> {
    const res = await this.request<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    this.setToken(res.token);
    return res;
  }

  async getMe(): Promise<{ user: User; profile: PatientProfile | ProviderProfile | null }> {
    return this.request('/api/auth/me');
  }

  async logout(): Promise<void> {
    try {
      await this.request('/api/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async forgotPassword(email: string): Promise<{ message: string; demoResetToken?: string }> {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Patients
  async getMyPatientProfile(): Promise<PatientProfile> {
    return this.request('/api/patients/me');
  }

  async updateMyPatientProfile(data: Partial<PatientProfile>): Promise<PatientProfile> {
    return this.request('/api/patients/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getPatientRecords(patientId?: string): Promise<{
    patient: PatientProfile;
    medicalRecords: MedicalRecord[];
    medications: Medication[];
    allergies: Allergy[];
    vaccinations: Vaccination[];
    laboratoryResults: LaboratoryResult[];
    healthMeasurements: HealthMeasurement[];
    appointments: Appointment[];
  }> {
    const endpoint = patientId ? `/api/patients/${patientId}/records` : '/api/patients/me/records';
    return this.request(endpoint);
  }

  async getAllPatients(): Promise<PatientProfile[]> {
    return this.request('/api/patients/all');
  }

  // Appointments
  async getAppointments(): Promise<Appointment[]> {
    return this.request('/api/appointments');
  }

  async createAppointment(data: {
    providerId: string;
    clinicId: string;
    appointmentDate: string;
    appointmentTime: string;
    reason: string;
    notes?: string;
    patientId?: string;
  }): Promise<Appointment> {
    return this.request('/api/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAppointment(id: string, data: {
    status?: string;
    notes?: string;
    appointmentDate?: string;
    appointmentTime?: string;
  }): Promise<Appointment> {
    return this.request(`/api/appointments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async cancelAppointment(id: string): Promise<{ message: string; appointment: Appointment }> {
    return this.request(`/api/appointments/${id}`, {
      method: 'DELETE',
    });
  }

  // Health Measurements
  async getMeasurements(params?: { patientId?: string; type?: string }): Promise<{
    disclaimer: string;
    measurements: HealthMeasurement[];
  }> {
    const query = new URLSearchParams();
    if (params?.patientId) query.set('patientId', params.patientId);
    if (params?.type) query.set('type', params.type);
    return this.request(`/api/measurements?${query.toString()}`);
  }

  async recordMeasurement(data: {
    measurementType: string;
    value: number;
    systolic?: number;
    diastolic?: number;
    unit: string;
    notes?: string;
    patientId?: string;
  }): Promise<{ disclaimer: string; measurement: HealthMeasurement }> {
    return this.request('/api/measurements', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMeasurementStats(patientId?: string): Promise<{
    latest: {
      bloodPressure: string;
      heartRate: string;
      temperature: string;
      weight: string;
      spo2: string;
    };
    totalRecords: number;
    lastRecordedDate: string | null;
  }> {
    const endpoint = patientId ? `/api/measurements/stats?patientId=${patientId}` : '/api/measurements/stats';
    return this.request(endpoint);
  }

  // Providers & Clinics
  async getProviders(query?: string): Promise<ProviderProfile[]> {
    const endpoint = query ? `/api/providers?search=${encodeURIComponent(query)}` : '/api/providers';
    return this.request(endpoint);
  }

  async getClinics(): Promise<Clinic[]> {
    return this.request('/api/clinics');
  }

  async createClinic(data: Partial<Clinic>): Promise<Clinic> {
    return this.request('/api/clinics', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Clinical Records / Prescriptions / Labs
  async createConsultationNote(data: {
    patientId: string;
    visitDate: string;
    diagnosis: string;
    clinicalNotes: string;
    treatmentPlan: string;
  }): Promise<MedicalRecord> {
    return this.request('/api/records/consultations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createMedicalRecord(data: {
    patientId: string;
    visitDate: string;
    diagnosis: string;
    clinicalNotes: string;
    treatmentPlan: string;
  }): Promise<MedicalRecord> {
    return this.createConsultationNote(data);
  }

  async prescribeMedication(data: {
    patientId: string;
    name: string;
    dosage: string;
    frequency: string;
    route?: string;
    startDate: string;
    endDate?: string;
    instructions: string;
    status?: string;
  }): Promise<Medication> {
    return this.request('/api/records/medications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addAllergy(data: {
    patientId: string;
    allergen: string;
    reaction: string;
    severity: string;
    diagnosedDate: string;
  }): Promise<Allergy> {
    return this.request('/api/records/allergies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addVaccination(data: {
    patientId: string;
    vaccineName: string;
    doseNumber: number;
    administeredDate: string;
    administeredBy: string;
    batchNumber: string;
    nextDueDate?: string;
  }): Promise<Vaccination> {
    return this.request('/api/records/vaccinations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async addLabResult(data: {
    patientId: string;
    testName: string;
    testCategory: string;
    testDate: string;
    resultValue: string;
    referenceRange: string;
    unit: string;
    status: string;
    interpretation?: string;
  }): Promise<LaboratoryResult> {
    return this.request('/api/records/labs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createLabResult(data: {
    patientId: string;
    testName: string;
    testCategory: string;
    testDate: string;
    resultValue: string;
    referenceRange: string;
    unit: string;
    status: string;
    interpretation?: string;
  }): Promise<LaboratoryResult> {
    return this.addLabResult(data);
  }

  // Notifications
  async getNotifications(): Promise<{ notifications: Notification[]; unreadCount: number }> {
    return this.request('/api/notifications');
  }

  async markNotificationRead(id: string): Promise<Notification> {
    return this.request(`/api/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead(): Promise<void> {
    await this.request('/api/notifications/read-all', { method: 'PUT' });
  }

  // Messages
  async getMessages(partnerId?: string): Promise<Message[]> {
    const endpoint = partnerId ? `/api/messages?partnerId=${partnerId}` : '/api/messages';
    return this.request(endpoint);
  }

  async sendMessage(data: { receiverId: string; content: string; appointmentId?: string }): Promise<Message> {
    return this.request('/api/messages/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Health Articles
  async getArticles(category?: string, search?: string): Promise<{ disclaimer: string; articles: HealthArticle[] }> {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (search) params.set('search', search);
    return this.request(`/api/health-articles?${params.toString()}`);
  }

  // Privacy & Consent
  async getConsent(): Promise<{
    governanceInfo: any;
    consentRecords: ConsentRecord[];
  }> {
    return this.request('/api/consent');
  }

  async toggleConsent(consentType: string, granted: boolean): Promise<ConsentRecord> {
    return this.request('/api/consent/toggle', {
      method: 'POST',
      body: JSON.stringify({ consentType, granted }),
    });
  }

  // Admin
  async getAdminStats(): Promise<SystemStats> {
    return this.request('/api/admin/stats');
  }

  async getAdminUsers(role?: string): Promise<any[]> {
    const endpoint = role ? `/api/admin/users?role=${role}` : '/api/admin/users';
    return this.request(endpoint);
  }

  async toggleUserStatus(userId: string): Promise<any> {
    return this.request(`/api/admin/users/${userId}/toggle-status`, { method: 'PUT' });
  }

  async getAuditLogs(params?: { action?: string; status?: string; search?: string }): Promise<AuditLog[]> {
    const q = new URLSearchParams();
    if (params?.action) q.set('action', params.action);
    if (params?.status) q.set('status', params.status);
    if (params?.search) q.set('search', params.search);
    return this.request(`/api/admin/audit-logs?${q.toString()}`);
  }

  // AI Assistant
  async askAi(prompt: string): Promise<{ reply: string; disclaimer: string }> {
    return this.request('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    });
  }

  // Global Search
  async search(query: string): Promise<{
    providers: ProviderProfile[];
    clinics: Clinic[];
    articles: HealthArticle[];
    appointments: Appointment[];
    patientRecords: any[];
  }> {
    return this.request(`/api/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiService();
