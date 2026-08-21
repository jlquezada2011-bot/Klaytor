-- Klaytor Digital Health Platform - PostgreSQL Seed Data
-- Seed file: seed_data.sql

-- 1. Insert Clinics
INSERT INTO clinics (id, name, address, phone, email, operating_hours)
VALUES 
  ('clinic_1', 'Klaytor St. Jude Medical Center', '742 Healthcare Boulevard, Suite 300, Metro City', '+1 (555) 234-5678', 'stjude@klaytorhealth.com', 'Mon-Fri: 8:00 AM - 6:00 PM, Sat: 9:00 AM - 1:00 PM'),
  ('clinic_2', 'Metro Heart & Wellness Institute', '108 Cardinal Santos Ave, Suite 102', '+1 (555) 876-5432', 'metroheart@klaytorhealth.com', 'Mon-Sat: 7:30 AM - 7:00 PM'),
  ('clinic_3', 'Sunrise Community Health Clinic', '45 Aurora Boulevard, District 4', '+1 (555) 345-6789', 'sunrise@klaytorhealth.com', 'Mon-Sun: 24/7 Urgent Care')
ON CONFLICT (id) DO NOTHING;

-- 2. Insert Users (Bcrypt hash for 'Password123!': $2a$10$3p4KzH5e2r90f...)
INSERT INTO users (id, email, password_hash, role, is_active)
VALUES
  ('usr_patient_1', 'patient@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT', TRUE),
  ('usr_patient_2', 'patient2@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PATIENT', TRUE),
  ('usr_doctor_1', 'doctor@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PROVIDER', TRUE),
  ('usr_doctor_2', 'dr.reyes@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'PROVIDER', TRUE),
  ('usr_admin_1', 'admin@example.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'ADMIN', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Insert Patient Profiles
INSERT INTO patient_profiles (id, user_id, first_name, last_name, date_of_birth, gender, blood_type, phone, address, emergency_contact_name, emergency_contact_phone)
VALUES
  ('pat_1', 'usr_patient_1', 'Jane', 'Doe', '1992-05-14', 'Female', 'A+', '+1 (555) 019-2834', '124 Maple Leaf Drive, Springfield', 'Robert Doe (Spouse)', '+1 (555) 019-9988'),
  ('pat_2', 'usr_patient_2', 'Carlos', 'Santana', '1985-11-20', 'Male', 'O+', '+1 (555) 888-1234', '88 Ocean View Way', 'Maria Santana', '+1 (555) 888-4321')
ON CONFLICT (id) DO NOTHING;

-- 4. Insert Provider Profiles
INSERT INTO provider_profiles (id, user_id, first_name, last_name, title, specialty, license_number, clinic_id, bio, phone)
VALUES
  ('prov_1', 'usr_doctor_1', 'Marcus', 'Vance', 'MD, FACC', 'Cardiology & Internal Medicine', 'MD-99824-NY', 'clinic_1', 'Board-certified cardiologist with over 14 years of clinical experience specializing in preventive cardiovascular wellness.', '+1 (555) 234-5678 ext. 101'),
  ('prov_2', 'usr_doctor_2', 'Elena', 'Reyes', 'MD, FAAP', 'Family Medicine & Pediatrics', 'MD-77412-CA', 'clinic_2', 'Family physician focused on comprehensive holistic health, pediatric development, and routine wellness checkups.', '+1 (555) 876-5432 ext. 204')
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Sample Appointments
INSERT INTO appointments (id, patient_id, provider_id, clinic_id, appointment_date, appointment_time, reason, status, notes)
VALUES
  ('apt_101', 'pat_1', 'prov_1', 'clinic_1', '2026-09-02', '10:30', 'Routine quarterly cardiovascular wellness checkup and blood pressure review.', 'Confirmed', 'Please bring your home blood pressure log.'),
  ('apt_102', 'pat_1', 'prov_2', 'clinic_2', '2026-09-15', '14:00', 'Annual comprehensive preventive health checkup and seasonal immunization.', 'Pending', 'Requested routine laboratory blood panel renewal.')
ON CONFLICT (id) DO NOTHING;

-- 6. Insert Medical Records
INSERT INTO medical_records (id, patient_id, provider_id, visit_date, diagnosis, clinical_notes, treatment_plan)
VALUES
  ('mr_001', 'pat_1', 'prov_1', '2026-06-10', 'Primary Stage 1 Essential Hypertension (ICD-10 I10)', 'Patient presented with resting BP 138/88 mmHg. Heart sounds S1/S2 normal without murmur.', 'Initiate Lisinopril 10mg oral daily. Continue self-monitoring home blood pressure.')
ON CONFLICT (id) DO NOTHING;

-- 7. Insert Medications
INSERT INTO medications (id, patient_id, provider_id, name, dosage, frequency, route, start_date, end_date, instructions, status)
VALUES
  ('med_01', 'pat_1', 'prov_1', 'Lisinopril', '10 mg', 'Once daily in the morning', 'Oral', '2026-06-10', '2027-06-10', 'Take with or without food every morning with a full glass of water.', 'Active'),
  ('med_02', 'pat_1', 'prov_2', 'Vitamin D3', '2,000 IU', 'Once daily with meals', 'Oral', '2026-01-15', NULL, 'Dietary supplement for bone mineralization and immune support.', 'Active')
ON CONFLICT (id) DO NOTHING;

-- 8. Insert Allergies
INSERT INTO allergies (id, patient_id, allergen, reaction, severity, diagnosed_date)
VALUES
  ('alg_01', 'pat_1', 'Amoxicillin / Penicillin Class', 'Generalized urticaria, cutaneous erythema, and mild facial pruritus', 'Moderate', '2018-03-22'),
  ('alg_02', 'pat_1', 'Peanuts & Tree Nuts', 'Oral itching and localized contact dermatitis', 'Mild', '2012-08-14')
ON CONFLICT (id) DO NOTHING;

-- 9. Insert Vaccinations
INSERT INTO vaccinations (id, patient_id, vaccine_name, dose_number, administered_date, administered_by, batch_number, next_due_date)
VALUES
  ('vac_01', 'pat_1', 'COVID-19 Updated Bivalent Booster (mRNA)', 4, '2025-10-18', 'Nurse R. Santos, RN', 'FL-99214A', '2026-10-18'),
  ('vac_02', 'pat_1', 'Influenza Quadrivalent 2025-2026', 1, '2025-10-18', 'Nurse R. Santos, RN', 'IN-44318X', '2026-10-01')
ON CONFLICT (id) DO NOTHING;

-- 10. Insert Health Articles
INSERT INTO health_articles (id, title, category, summary, content, read_time, author)
VALUES
  ('art_01', 'Understanding Blood Pressure Readings: Systolic vs. Diastolic', 'Common health information', 'Learn what the numbers mean and how to properly measure at home.', 'Blood pressure is recorded as two numbers: systolic pressure and diastolic pressure. Normal is under 120/80 mmHg.', '3 min read', 'Dr. Marcus Vance, Cardiologist'),
  ('art_02', 'The Heart-Healthy Mediterranean Diet', 'Nutrition', 'How olive oil, vegetables, and whole grains protect your heart.', 'Extensive clinical research demonstrates that the Mediterranean diet reduces heart disease risks.', '4 min read', 'Klaytor Clinical Nutrition Team')
ON CONFLICT (id) DO NOTHING;
