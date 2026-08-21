-- Klaytor Digital Health Platform - PostgreSQL Initial Schema Migration
-- Migration: 001_initial_schema.sql

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum Types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PATIENT', 'PROVIDER', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('Pending', 'Confirmed', 'Completed', 'Cancelled', 'Rescheduled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE measurement_type AS ENUM ('temperature', 'blood_pressure', 'heart_rate', 'weight', 'spo2');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE lab_status AS ENUM ('Normal', 'Abnormal', 'Critical', 'Pending');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE severity_level AS ENUM ('Mild', 'Moderate', 'Severe');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'PATIENT',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Clinics Table
CREATE TABLE IF NOT EXISTS clinics (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    operating_hours TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Patient Profiles Table
CREATE TABLE IF NOT EXISTS patient_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(50) NOT NULL,
    blood_type VARCHAR(10),
    phone VARCHAR(50),
    address TEXT,
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patient_user_id ON patient_profiles(user_id);

-- 4. Provider Profiles Table
CREATE TABLE IF NOT EXISTS provider_profiles (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(50) NOT NULL DEFAULT 'MD',
    specialty VARCHAR(150) NOT NULL,
    license_number VARCHAR(100) UNIQUE NOT NULL,
    clinic_id VARCHAR(64) REFERENCES clinics(id) ON DELETE SET NULL,
    bio TEXT,
    phone VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_provider_user_id ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_clinic_id ON provider_profiles(clinic_id);

-- 5. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    provider_id VARCHAR(64) NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    clinic_id VARCHAR(64) REFERENCES clinics(id) ON DELETE SET NULL,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(10) NOT NULL,
    reason TEXT NOT NULL,
    status appointment_status NOT NULL DEFAULT 'Pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_provider ON appointments(provider_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);

-- 6. Medical Records (Clinical Consultations) Table
CREATE TABLE IF NOT EXISTS medical_records (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    provider_id VARCHAR(64) NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
    visit_date DATE NOT NULL,
    diagnosis TEXT NOT NULL,
    clinical_notes TEXT NOT NULL,
    treatment_plan TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_med_records_patient ON medical_records(patient_id);

-- 7. Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    provider_id VARCHAR(64) REFERENCES provider_profiles(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(150) NOT NULL,
    route VARCHAR(50) DEFAULT 'Oral',
    start_date DATE NOT NULL,
    end_date DATE,
    instructions TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_medications_patient ON medications(patient_id);

-- 8. Allergies Table
CREATE TABLE IF NOT EXISTS allergies (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    allergen VARCHAR(255) NOT NULL,
    reaction TEXT NOT NULL,
    severity severity_level NOT NULL DEFAULT 'Moderate',
    diagnosed_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_allergies_patient ON allergies(patient_id);

-- 9. Vaccinations Table
CREATE TABLE IF NOT EXISTS vaccinations (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    vaccine_name VARCHAR(255) NOT NULL,
    dose_number INT NOT NULL DEFAULT 1,
    administered_date DATE NOT NULL,
    administered_by VARCHAR(255) NOT NULL,
    batch_number VARCHAR(100) NOT NULL,
    next_due_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_vaccinations_patient ON vaccinations(patient_id);

-- 10. Laboratory Results Table
CREATE TABLE IF NOT EXISTS laboratory_results (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    provider_id VARCHAR(64) REFERENCES provider_profiles(id) ON DELETE SET NULL,
    test_name VARCHAR(255) NOT NULL,
    test_category VARCHAR(150) NOT NULL,
    test_date DATE NOT NULL,
    result_value TEXT NOT NULL,
    reference_range TEXT NOT NULL,
    unit VARCHAR(50) NOT NULL,
    status lab_status NOT NULL DEFAULT 'Normal',
    interpretation TEXT,
    file_name VARCHAR(255),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_labs_patient ON laboratory_results(patient_id);

-- 11. Health Measurements (Vitals) Table
CREATE TABLE IF NOT EXISTS health_measurements (
    id VARCHAR(64) PRIMARY KEY,
    patient_id VARCHAR(64) NOT NULL REFERENCES patient_profiles(id) ON DELETE CASCADE,
    measurement_type measurement_type NOT NULL,
    value NUMERIC(10, 2) NOT NULL,
    systolic NUMERIC(10, 2),
    diastolic NUMERIC(10, 2),
    unit VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_measurements_patient ON health_measurements(patient_id);
CREATE INDEX IF NOT EXISTS idx_measurements_type ON health_measurements(measurement_type);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    related_id VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- 13. Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(64) PRIMARY KEY,
    sender_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_id VARCHAR(64) REFERENCES appointments(id) ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver ON messages(receiver_id);

-- 14. Health Articles Table
CREATE TABLE IF NOT EXISTS health_articles (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    summary TEXT NOT NULL,
    content TEXT NOT NULL,
    read_time VARCHAR(50) NOT NULL,
    author VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. Consent Records Table
CREATE TABLE IF NOT EXISTS consent_records (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    terms_version VARCHAR(50) NOT NULL DEFAULT 'v1.4',
    ip_address VARCHAR(100),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, consent_type)
);

-- 16. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64),
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    resource_id VARCHAR(64),
    details TEXT NOT NULL,
    ip_address VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
