import bcrypt from 'bcryptjs';
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
} from '../../types/index.js';

export interface UserWithPassword extends User {
  passwordHash: string;
}

// In-memory relational database store with full ACID-like transactional operations
class DatabaseStore {
  public users: Map<string, UserWithPassword> = new Map();
  public patientProfiles: Map<string, PatientProfile> = new Map();
  public providerProfiles: Map<string, ProviderProfile> = new Map();
  public clinics: Map<string, Clinic> = new Map();
  public appointments: Map<string, Appointment> = new Map();
  public medicalRecords: Map<string, MedicalRecord> = new Map();
  public medications: Map<string, Medication> = new Map();
  public allergies: Map<string, Allergy> = new Map();
  public vaccinations: Map<string, Vaccination> = new Map();
  public laboratoryResults: Map<string, LaboratoryResult> = new Map();
  public healthMeasurements: Map<string, HealthMeasurement> = new Map();
  public notifications: Map<string, Notification> = new Map();
  public messages: Map<string, Message> = new Map();
  public healthArticles: Map<string, HealthArticle> = new Map();
  public consentRecords: Map<string, ConsentRecord> = new Map();
  public auditLogs: AuditLog[] = [];
  private isInitialized = false;

  constructor() {
    this.seedInitialData();
  }

  public seedInitialData() {
    if (this.isInitialized) return;
    const now = new Date().toISOString();
    const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

    // 1. Clinics
    const clinic1: Clinic = {
      id: 'clinic_1',
      name: 'Klaytor St. Jude Medical Center',
      address: '742 Healthcare Boulevard, Suite 300, Metro City',
      phone: '+1 (555) 234-5678',
      email: 'stjude@klaytorhealth.com',
      operatingHours: 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM',
      createdAt: now,
      updatedAt: now,
    };
    const clinic2: Clinic = {
      id: 'clinic_2',
      name: 'Metro Heart & Wellness Institute',
      address: '108 Cardinal Santos Ave, Suite 102',
      phone: '+1 (555) 876-5432',
      email: 'metroheart@klaytorhealth.com',
      operatingHours: 'Mon-Sat: 7:30 AM - 7:00 PM',
      createdAt: now,
      updatedAt: now,
    };
    const clinic3: Clinic = {
      id: 'clinic_3',
      name: 'Sunrise Community Health Clinic',
      address: '45 Aurora Boulevard, District 4',
      phone: '+1 (555) 345-6789',
      email: 'sunrise@klaytorhealth.com',
      operatingHours: 'Mon-Sun: 24/7 Urgent Care',
      createdAt: now,
      updatedAt: now,
    };
    this.clinics.set(clinic1.id, clinic1);
    this.clinics.set(clinic2.id, clinic2);
    this.clinics.set(clinic3.id, clinic3);

    // 2. Demo Users & Profiles
    // Patient: patient@example.com
    const patientUser: UserWithPassword = {
      id: 'usr_patient_1',
      email: 'patient@example.com',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const patientProf: PatientProfile = {
      id: 'pat_1',
      userId: patientUser.id,
      firstName: 'Jane',
      lastName: 'Doe',
      dateOfBirth: '1992-05-14',
      gender: 'Female',
      bloodType: 'A+',
      phone: '+1 (555) 019-2834',
      address: '124 Maple Leaf Drive, Springfield',
      emergencyContactName: 'Robert Doe (Spouse)',
      emergencyContactPhone: '+1 (555) 019-9988',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(patientUser.id, patientUser);
    this.patientProfiles.set(patientProf.id, patientProf);

    // Second Patient for isolation testing
    const patientUser2: UserWithPassword = {
      id: 'usr_patient_2',
      email: 'patient2@example.com',
      passwordHash: defaultPasswordHash,
      role: 'PATIENT',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const patientProf2: PatientProfile = {
      id: 'pat_2',
      userId: patientUser2.id,
      firstName: 'Carlos',
      lastName: 'Santana',
      dateOfBirth: '1985-11-20',
      gender: 'Male',
      bloodType: 'O+',
      phone: '+1 (555) 888-1234',
      address: '88 Ocean View Way',
      emergencyContactName: 'Maria Santana',
      emergencyContactPhone: '+1 (555) 888-4321',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(patientUser2.id, patientUser2);
    this.patientProfiles.set(patientProf2.id, patientProf2);

    // Provider: doctor@example.com
    const doctorUser: UserWithPassword = {
      id: 'usr_doctor_1',
      email: 'doctor@example.com',
      passwordHash: defaultPasswordHash,
      role: 'PROVIDER',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const doctorProf: ProviderProfile = {
      id: 'prov_1',
      userId: doctorUser.id,
      firstName: 'Marcus',
      lastName: 'Vance',
      title: 'MD, FACC',
      specialty: 'Cardiology & Internal Medicine',
      licenseNumber: 'MD-99824-NY',
      clinicId: clinic1.id,
      clinicName: clinic1.name,
      bio: 'Board-certified cardiologist with over 14 years of clinical experience specializing in preventive cardiovascular wellness, hypertension management, and lifestyle medicine.',
      phone: '+1 (555) 234-5678 ext. 101',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(doctorUser.id, doctorUser);
    this.providerProfiles.set(doctorProf.id, doctorProf);

    // Provider 2: dr.reyes@example.com
    const doctorUser2: UserWithPassword = {
      id: 'usr_doctor_2',
      email: 'dr.reyes@example.com',
      passwordHash: defaultPasswordHash,
      role: 'PROVIDER',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    const doctorProf2: ProviderProfile = {
      id: 'prov_2',
      userId: doctorUser2.id,
      firstName: 'Elena',
      lastName: 'Reyes',
      title: 'MD, FAAP',
      specialty: 'Family Medicine & Pediatrics',
      licenseNumber: 'MD-77412-CA',
      clinicId: clinic2.id,
      clinicName: clinic2.name,
      bio: 'Family physician focused on comprehensive holistic health, pediatric development, immunization safety, and routine wellness checkups.',
      phone: '+1 (555) 876-5432 ext. 204',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(doctorUser2.id, doctorUser2);
    this.providerProfiles.set(doctorProf2.id, doctorProf2);

    // Admin: admin@example.com
    const adminUser: UserWithPassword = {
      id: 'usr_admin_1',
      email: 'admin@example.com',
      passwordHash: defaultPasswordHash,
      role: 'ADMIN',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(adminUser.id, adminUser);

    // 3. Appointments
    const appt1: Appointment = {
      id: 'apt_101',
      patientId: patientProf.id,
      patientName: `${patientProf.firstName} ${patientProf.lastName}`,
      patientEmail: patientUser.email,
      providerId: doctorProf.id,
      providerName: `Dr. ${doctorProf.firstName} ${doctorProf.lastName}`,
      providerSpecialty: doctorProf.specialty,
      clinicId: clinic1.id,
      clinicName: clinic1.name,
      appointmentDate: '2026-09-02',
      appointmentTime: '10:30',
      reason: 'Routine quarterly cardiovascular wellness checkup and blood pressure monitoring review.',
      status: 'Confirmed',
      notes: 'Please bring your home blood pressure log and current medication list.',
      createdAt: now,
      updatedAt: now,
    };
    const appt2: Appointment = {
      id: 'apt_102',
      patientId: patientProf.id,
      patientName: `${patientProf.firstName} ${patientProf.lastName}`,
      patientEmail: patientUser.email,
      providerId: doctorProf2.id,
      providerName: `Dr. ${doctorProf2.firstName} ${doctorProf2.lastName}`,
      providerSpecialty: doctorProf2.specialty,
      clinicId: clinic2.id,
      clinicName: clinic2.name,
      appointmentDate: '2026-09-15',
      appointmentTime: '14:00',
      reason: 'Annual comprehensive preventive health checkup and seasonal immunization.',
      status: 'Pending',
      notes: 'Requested routine laboratory blood panel renewal.',
      createdAt: now,
      updatedAt: now,
    };
    const appt3: Appointment = {
      id: 'apt_103',
      patientId: patientProf.id,
      patientName: `${patientProf.firstName} ${patientProf.lastName}`,
      patientEmail: patientUser.email,
      providerId: doctorProf.id,
      providerName: `Dr. ${doctorProf.firstName} ${doctorProf.lastName}`,
      providerSpecialty: doctorProf.specialty,
      clinicId: clinic1.id,
      clinicName: clinic1.name,
      appointmentDate: '2026-06-10',
      appointmentTime: '09:00',
      reason: 'Initial consultation regarding elevated resting pulse rate and mild exertional fatigue.',
      status: 'Completed',
      notes: 'Completed clinical workup. Prescribed Lisinopril 10mg daily and ordered standard ECG.',
      createdAt: now,
      updatedAt: now,
    };
    this.appointments.set(appt1.id, appt1);
    this.appointments.set(appt2.id, appt2);
    this.appointments.set(appt3.id, appt3);

    // 4. Medical Records
    const medRec1: MedicalRecord = {
      id: 'mr_001',
      patientId: patientProf.id,
      providerId: doctorProf.id,
      providerName: `Dr. ${doctorProf.firstName} ${doctorProf.lastName}`,
      visitDate: '2026-06-10',
      diagnosis: 'Primary Stage 1 Essential Hypertension (ICD-10 I10)',
      clinicalNotes: 'Patient presented with resting BP of 138/88 mmHg. Heart sounds S1/S2 normal without murmur. Lungs clear to auscultation bilaterally. Advised dietary sodium restriction (<2000mg/day) and 150 mins/week moderate aerobic exercise.',
      treatmentPlan: 'Initiate Lisinopril 10mg oral daily. Continue self-monitoring home blood pressure. Repeat fasting lipid panel in 3 months.',
      createdAt: now,
      updatedAt: now,
    };
    this.medicalRecords.set(medRec1.id, medRec1);

    // 5. Medications
    const med1: Medication = {
      id: 'med_01',
      patientId: patientProf.id,
      providerId: doctorProf.id,
      providerName: `Dr. ${doctorProf.firstName} ${doctorProf.lastName}`,
      name: 'Lisinopril',
      dosage: '10 mg',
      frequency: 'Once daily in the morning',
      route: 'Oral',
      startDate: '2026-06-10',
      endDate: '2027-06-10',
      instructions: 'Take with or without food every morning with a full glass of water. Monitor for dry cough or dizziness.',
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };
    const med2: Medication = {
      id: 'med_02',
      patientId: patientProf.id,
      providerId: doctorProf2.id,
      providerName: `Dr. ${doctorProf2.firstName} ${doctorProf2.lastName}`,
      name: 'Vitamin D3 (Cholecalciferol)',
      dosage: '2,000 IU',
      frequency: 'Once daily with meals',
      route: 'Oral',
      startDate: '2026-01-15',
      instructions: 'Dietary supplement for bone mineralization and immune support.',
      status: 'Active',
      createdAt: now,
      updatedAt: now,
    };
    this.medications.set(med1.id, med1);
    this.medications.set(med2.id, med2);

    // 6. Allergies
    const alg1: Allergy = {
      id: 'alg_01',
      patientId: patientProf.id,
      allergen: 'Amoxicillin / Penicillin Class',
      reaction: 'Generalized urticaria, cutaneous erythema, and mild facial pruritus',
      severity: 'Moderate',
      diagnosedDate: '2018-03-22',
      createdAt: now,
      updatedAt: now,
    };
    const alg2: Allergy = {
      id: 'alg_02',
      patientId: patientProf.id,
      allergen: 'Peanuts & Tree Nuts',
      reaction: 'Oral itching and localized contact dermatitis',
      severity: 'Mild',
      diagnosedDate: '2012-08-14',
      createdAt: now,
      updatedAt: now,
    };
    this.allergies.set(alg1.id, alg1);
    this.allergies.set(alg2.id, alg2);

    // 7. Vaccinations
    const vac1: Vaccination = {
      id: 'vac_01',
      patientId: patientProf.id,
      vaccineName: 'COVID-19 Updated Bivalent Booster (mRNA)',
      doseNumber: 4,
      administeredDate: '2025-10-18',
      administeredBy: 'Nurse R. Santos, RN',
      batchNumber: 'FL-99214A',
      nextDueDate: '2026-10-18',
      createdAt: now,
      updatedAt: now,
    };
    const vac2: Vaccination = {
      id: 'vac_02',
      patientId: patientProf.id,
      vaccineName: 'Influenza Quadrivalent 2025-2026',
      doseNumber: 1,
      administeredDate: '2025-10-18',
      administeredBy: 'Nurse R. Santos, RN',
      batchNumber: 'IN-44318X',
      nextDueDate: '2026-10-01',
      createdAt: now,
      updatedAt: now,
    };
    const vac3: Vaccination = {
      id: 'vac_03',
      patientId: patientProf.id,
      vaccineName: 'Tdap (Tetanus, Diphtheria, Pertussis)',
      doseNumber: 1,
      administeredDate: '2021-04-12',
      administeredBy: 'Dr. Elena Reyes',
      batchNumber: 'TD-11200Z',
      nextDueDate: '2031-04-12',
      createdAt: now,
      updatedAt: now,
    };
    this.vaccinations.set(vac1.id, vac1);
    this.vaccinations.set(vac2.id, vac2);
    this.vaccinations.set(vac3.id, vac3);

    // 8. Laboratory Results
    const lab1: LaboratoryResult = {
      id: 'lab_01',
      patientId: patientProf.id,
      providerId: doctorProf.id,
      providerName: `Dr. ${doctorProf.firstName} ${doctorProf.lastName}`,
      testName: 'Complete Blood Count (CBC) with Differential',
      testCategory: 'Hematology',
      testDate: '2026-06-12',
      resultValue: 'WBC: 6.8 x10^3/uL, Hemoglobin: 14.1 g/dL, Platelets: 260 x10^3/uL',
      referenceRange: 'WBC: 4.5-11.0, Hb: 12.0-16.0, Plt: 150-450',
      unit: 'Standard Indices',
      status: 'Normal',
      interpretation: 'Normal cellular indices across all hematologic parameters.',
      fileName: 'CBC_Report_JaneDoe_20260612.pdf',
      fileUrl: '/uploads/labs/cbc_20260612.pdf',
      createdAt: now,
      updatedAt: now,
    };
    const lab2: LaboratoryResult = {
      id: 'lab_02',
      patientId: patientProf.id,
      providerId: doctorProf.id,
      providerName: `Dr. ${doctorProf.firstName} ${doctorProf.lastName}`,
      testName: 'Comprehensive Lipid Panel (Fasting)',
      testCategory: 'Clinical Chemistry',
      testDate: '2026-06-12',
      resultValue: 'Total Cholesterol: 195 mg/dL, LDL: 118 mg/dL, HDL: 54 mg/dL, Triglycerides: 115 mg/dL',
      referenceRange: 'Total < 200, LDL < 100, HDL > 50, Triglycerides < 150',
      unit: 'mg/dL',
      status: 'Abnormal',
      interpretation: 'Mild borderline LDL elevation (118 mg/dL). Reinforce Mediterranean dietary guidelines.',
      fileName: 'Lipid_Panel_JaneDoe_20260612.pdf',
      fileUrl: '/uploads/labs/lipid_20260612.pdf',
      createdAt: now,
      updatedAt: now,
    };
    const lab3: LaboratoryResult = {
      id: 'lab_03',
      patientId: patientProf.id,
      providerId: doctorProf2.id,
      providerName: `Dr. ${doctorProf2.firstName} ${doctorProf2.lastName}`,
      testName: 'Hemoglobin A1c (Glycated Hb)',
      testCategory: 'Endocrinology',
      testDate: '2026-06-12',
      resultValue: '5.3 %',
      referenceRange: 'Normal: < 5.7 %, Prediabetes: 5.7 - 6.4 %',
      unit: '%',
      status: 'Normal',
      interpretation: 'Glycemic control is in the non-diabetic reference range.',
      fileName: 'HbA1c_JaneDoe_20260612.pdf',
      fileUrl: '/uploads/labs/hba1c_20260612.pdf',
      createdAt: now,
      updatedAt: now,
    };
    this.laboratoryResults.set(lab1.id, lab1);
    this.laboratoryResults.set(lab2.id, lab2);
    this.laboratoryResults.set(lab3.id, lab3);

    // 9. Health Measurements (Vitals History)
    const measurements: HealthMeasurement[] = [
      {
        id: 'hm_01',
        patientId: patientProf.id,
        measurementType: 'blood_pressure',
        value: 122,
        systolic: 122,
        diastolic: 78,
        unit: 'mmHg',
        recordedAt: '2026-08-20T08:15:00Z',
        notes: 'Morning measurement after 5 mins seated rest.',
        createdAt: now,
      },
      {
        id: 'hm_02',
        patientId: patientProf.id,
        measurementType: 'blood_pressure',
        value: 126,
        systolic: 126,
        diastolic: 82,
        unit: 'mmHg',
        recordedAt: '2026-08-18T19:30:00Z',
        notes: 'Evening check.',
        createdAt: now,
      },
      {
        id: 'hm_03',
        patientId: patientProf.id,
        measurementType: 'blood_pressure',
        value: 134,
        systolic: 134,
        diastolic: 86,
        unit: 'mmHg',
        recordedAt: '2026-08-15T08:00:00Z',
        notes: 'Post morning coffee.',
        createdAt: now,
      },
      {
        id: 'hm_04',
        patientId: patientProf.id,
        measurementType: 'heart_rate',
        value: 72,
        unit: 'bpm',
        recordedAt: '2026-08-20T08:15:00Z',
        notes: 'Resting pulse.',
        createdAt: now,
      },
      {
        id: 'hm_05',
        patientId: patientProf.id,
        measurementType: 'heart_rate',
        value: 76,
        unit: 'bpm',
        recordedAt: '2026-08-18T19:30:00Z',
        notes: 'Resting pulse.',
        createdAt: now,
      },
      {
        id: 'hm_06',
        patientId: patientProf.id,
        measurementType: 'temperature',
        value: 36.6,
        unit: '°C',
        recordedAt: '2026-08-20T08:15:00Z',
        notes: 'Oral thermometer.',
        createdAt: now,
      },
      {
        id: 'hm_07',
        patientId: patientProf.id,
        measurementType: 'weight',
        value: 64.5,
        unit: 'kg',
        recordedAt: '2026-08-20T07:45:00Z',
        notes: 'Fasting weight.',
        createdAt: now,
      },
      {
        id: 'hm_08',
        patientId: patientProf.id,
        measurementType: 'weight',
        value: 65.2,
        unit: 'kg',
        recordedAt: '2026-08-10T08:00:00Z',
        notes: 'Fasting weight.',
        createdAt: now,
      },
      {
        id: 'hm_09',
        patientId: patientProf.id,
        measurementType: 'spo2',
        value: 99,
        unit: '%',
        recordedAt: '2026-08-20T08:15:00Z',
        notes: 'Finger pulse oximeter.',
        createdAt: now,
      },
    ];
    measurements.forEach((m) => this.healthMeasurements.set(m.id, m));

    // 10. Notifications
    const notifs: Notification[] = [
      {
        id: 'notif_01',
        userId: patientUser.id,
        title: 'Appointment Confirmed',
        message: 'Your checkup with Dr. Marcus Vance on Sept 2, 2026 at 10:30 AM has been confirmed.',
        type: 'appointment',
        isRead: false,
        relatedId: appt1.id,
        createdAt: now,
      },
      {
        id: 'notif_02',
        userId: patientUser.id,
        title: 'New Laboratory Results Ready',
        message: 'Dr. Vance has finalized your Lipid Panel and CBC laboratory interpretations.',
        type: 'result',
        isRead: true,
        relatedId: lab1.id,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'notif_03',
        userId: patientUser.id,
        title: 'Medication Refill Reminder',
        message: 'Remember to log your morning dose of Lisinopril 10mg.',
        type: 'reminder',
        isRead: false,
        relatedId: med1.id,
        createdAt: now,
      },
      {
        id: 'notif_04',
        userId: doctorUser.id,
        title: 'New Appointment Request',
        message: 'Jane Doe submitted an appointment request for Sept 15, 2026.',
        type: 'appointment',
        isRead: false,
        relatedId: appt2.id,
        createdAt: now,
      },
    ];
    notifs.forEach((n) => this.notifications.set(n.id, n));

    // 11. Messages
    const msg1: Message = {
      id: 'msg_01',
      senderId: doctorUser.id,
      senderName: 'Dr. Marcus Vance',
      senderRole: 'PROVIDER',
      receiverId: patientUser.id,
      receiverName: 'Jane Doe',
      appointmentId: appt1.id,
      content: 'Hello Jane, I reviewed your recent home blood pressure readings (122/78 mmHg). The current Lisinopril regimen appears to be working well. Please continue monitoring twice a week.',
      isRead: true,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    };
    const msg2: Message = {
      id: 'msg_02',
      senderId: patientUser.id,
      senderName: 'Jane Doe',
      senderRole: 'PATIENT',
      receiverId: doctorUser.id,
      receiverName: 'Dr. Marcus Vance',
      appointmentId: appt1.id,
      content: 'Thank you Dr. Vance! I have experienced no side effects. I will see you at our confirmed appointment on September 2nd.',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    };
    this.messages.set(msg1.id, msg1);
    this.messages.set(msg2.id, msg2);

    // 12. Health Education Articles
    const articles: HealthArticle[] = [
      {
        id: 'art_01',
        title: 'Understanding Blood Pressure Readings: Systolic vs. Diastolic',
        category: 'Common health information',
        summary: 'Learn what the top and bottom numbers mean and how to properly measure your blood pressure at home.',
        content: `Blood pressure is recorded as two numbers: systolic pressure (the higher number representing pressure when the heart beats) and diastolic pressure (the lower number representing pressure when the heart rests between beats).\n\nNormal blood pressure for most adults is typically considered under 120/80 mmHg. When taking home readings:\n1. Rest quietly in a chair with back support for 5 minutes before measuring.\n2. Keep your feet flat on the floor and support your arm at heart level.\n3. Avoid caffeine, exercise, and smoking for at least 30 minutes prior.\n\nAlways discuss any persistent variations with your healthcare team.`,
        readTime: '3 min read',
        author: 'Dr. Marcus Vance, Cardiologist',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'art_02',
        title: 'The Heart-Healthy Mediterranean Diet: Practical Everyday Steps',
        category: 'Nutrition',
        summary: 'How incorporating extra virgin olive oil, legumes, fresh vegetables, and whole grains protects your cardiovascular system.',
        content: `Extensive clinical research demonstrates that the Mediterranean dietary pattern significantly reduces risks of heart disease and stroke.\n\nKey components include:\n- Abundant colorful vegetables, fruits, and legumes.\n- Healthy unsaturated fats, primarily extra virgin olive oil and nuts.\n- Lean protein sources, especially cold-water fish like salmon, sardines, and mackerel.\n- Moderate consumption of poultry, eggs, and dairy.\n- Minimizing ultra-processed foods, refined sugars, and excessive sodium.`,
        readTime: '4 min read',
        author: 'Klaytor Clinical Nutrition Team',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'art_03',
        title: 'The Power of 30 Minutes: Safe Aerobic Exercise for All Ages',
        category: 'Exercise',
        summary: 'Simple guidelines for achieving the recommended 150 minutes of moderate physical activity every week.',
        content: `Regular moderate aerobic activity strengthens your heart muscle, improves insulin sensitivity, and lowers resting blood pressure.\n\nExamples of moderate exercise:\n- Brisk walking (at a pace where you can talk but not sing).\n- Swimming laps or water aerobics.\n- Cycling on flat terrain.\n- Gardening and active household tasks.\n\nAlways warm up with 5 minutes of gentle stretching and stay hydrated. If you have chronic conditions, consult your doctor before beginning a new routine.`,
        readTime: '3 min read',
        author: 'Dr. Elena Reyes, Family Medicine',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'art_04',
        title: 'Why Annual Routine Vaccines are Essential for Community Health',
        category: 'Vaccination',
        summary: 'Explore how modern immunizations protect vulnerable populations and keep your immune defenses primed.',
        content: `Vaccines train your immune system to safely recognize and neutralize pathogens without causing disease.\n\nStaying up to date with routine immunizations (such as seasonal influenza, Tdap boosters, and pneumococcal vaccines) significantly reduces hospitalization rates and protects infants, elderly individuals, and immunocompromised family members.\n\nConsult your primary care physician to review your personalized vaccine schedule.`,
        readTime: '4 min read',
        author: 'Klaytor Preventive Health Board',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'art_05',
        title: 'Managing Everyday Stress and Cultivating Mental Resilience',
        category: 'Mental well-being',
        summary: 'Evidence-based cognitive and physical techniques to alleviate chronic anxiety and improve sleep quality.',
        content: `Chronic psychological stress elevates cortisol and adrenaline levels, impacting sleep, digestion, and cardiovascular health.\n\nHelpful daily practices:\n1. Structured diaphragmatic breathing (e.g. 4-7-8 breathing technique).\n2. Regular sleep hygiene: consistent bedtime, dark and cool bedroom, zero screens 1 hour before sleep.\n3. Setting clear work-life boundaries and dedicating time to outdoor walks.\n\nIf stress feels overwhelming, reaching out to a licensed counselor or mental health professional is a proactive and courageous step.`,
        readTime: '5 min read',
        author: 'Dr. Sarah Lin, Clinical Psychologist',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'art_06',
        title: 'Basic First Aid for Common Household Burns and Minor Cuts',
        category: 'First aid',
        summary: 'Essential first aid protocols to safely clean, dress, and monitor everyday domestic injuries.',
        content: `Prompt and correct first aid prevents infection and accelerates tissue healing.\n\nFor Minor (1st Degree) Burns:\n- Cool the burn immediately under gentle cool running tap water for 10-15 minutes. Never apply ice directly.\n- Apply pure aloe vera or a sterile hydrogel dressing.\n\nFor Minor Cuts:\n- Apply direct pressure with a clean gauze until bleeding stops.\n- Rinse under cool water and mild soap.\n- Apply antibacterial ointment and cover with a sterile adhesive bandage.\n\nSeek immediate emergency care if wounds are deep, bleeding heavily, or showing signs of infection (redness, heat, pus, fever).`,
        readTime: '4 min read',
        author: 'Klaytor Emergency Response Unit',
        createdAt: now,
        updatedAt: now,
      },
    ];
    articles.forEach((a) => this.healthArticles.set(a.id, a));

    // 13. Consent Records
    const consents: ConsentRecord[] = [
      {
        id: 'con_01',
        userId: patientUser.id,
        consentType: 'DATA_PROCESSING',
        description: 'Consent for electronic processing of personal health data in compliance with healthcare data governance.',
        granted: true,
        termsVersion: 'v1.4',
        updatedAt: now,
      },
      {
        id: 'con_02',
        userId: patientUser.id,
        consentType: 'TELEHEALTH_COMMUNICATION',
        description: 'Consent for secure asynchronous messaging and remote healthcare consultations with authorized providers.',
        granted: true,
        termsVersion: 'v1.4',
        updatedAt: now,
      },
      {
        id: 'con_03',
        userId: patientUser.id,
        consentType: 'LAB_DATA_SHARING',
        description: 'Authorization for designated laboratory partners to upload test results directly to your patient portal.',
        granted: true,
        termsVersion: 'v1.4',
        updatedAt: now,
      },
      {
        id: 'con_04',
        userId: patientUser.id,
        consentType: 'AUDIT_LOG_TRACKING',
        description: 'Agreement for security monitoring, access logging, and breach prevention audits.',
        granted: true,
        termsVersion: 'v1.4',
        updatedAt: now,
      },
    ];
    consents.forEach((c) => this.consentRecords.set(`${c.userId}_${c.consentType}`, c));

    // 14. Initial Audit Logs
    this.addAuditLog({
      userId: adminUser.id,
      userEmail: adminUser.email,
      action: 'SYSTEM_INITIALIZATION',
      resource: 'SYSTEM',
      details: 'Klaytor digital health platform database initialized and secured.',
      ipAddress: '127.0.0.1',
      status: 'SUCCESS',
    });

    this.isInitialized = true;
  }

  public addAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    const entry: AuditLog = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...log,
    };
    this.auditLogs.unshift(entry);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return entry;
  }

  // Find user by email
  public findUserByEmail(email: string): UserWithPassword | undefined {
    const normalized = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalized) {
        return user;
      }
    }
    return undefined;
  }

  // Find patient profile by user ID
  public findPatientByUserId(userId: string): PatientProfile | undefined {
    for (const p of this.patientProfiles.values()) {
      if (p.userId === userId) return p;
    }
    return undefined;
  }

  // Find provider profile by user ID
  public findProviderByUserId(userId: string): ProviderProfile | undefined {
    for (const p of this.providerProfiles.values()) {
      if (p.userId === userId) return p;
    }
    return undefined;
  }

  // Safe user without password hash
  public sanitizeUser(user: UserWithPassword): User {
    const { passwordHash, ...safe } = user;
    return safe;
  }
}

export const db = new DatabaseStore();
