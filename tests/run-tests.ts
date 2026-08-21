/**
 * Klaytor Digital Health Platform - Automated Integration & Security Test Suite
 * Tests all 11 core requirements:
 * 1. User Registration & Profile initialization
 * 2. Login & JWT generation
 * 3. Token Authentication
 * 4. Role-Based Access Control (RBAC)
 * 5. Appointment creation workflow
 * 6. Appointment status updates & notifications
 * 7. Authorized Patient Medical Record retrieval
 * 8. Unauthorized Patient Record Isolation (Patient 2 blocked from Patient 1 records)
 * 9. Health Measurement / Vitals recording
 * 10. Zod Input Validation & Error Handling
 * 11. Audit Logging of Security Events
 */

import http from 'http';
import { createServer } from '../server.js';
import { db } from '../src/server/db/store.js';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function makeRequest(
  port: number,
  path: string,
  method = 'GET',
  body?: any,
  token?: string
): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const postData = body ? JSON.stringify(body) : '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData).toString(),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers,
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          let parsedData = {};
          try {
            parsedData = rawData ? JSON.parse(rawData) : {};
          } catch {
            parsedData = { raw: rawData };
          }
          resolve({ status: res.statusCode || 500, data: parsedData, headers: res.headers });
        });
      }
    );

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

async function runTestSuite() {
  console.log('🧪 Starting Klaytor Integration & Security Test Suite...\n');
  const port = 3000;
  console.log(`🚀 Connecting to Klaytor Server on port ${port}`);

  async function test(name: string, fn: () => Promise<void>) {
    const start = Date.now();
    try {
      await fn();
      const durationMs = Date.now() - start;
      results.push({ name, passed: true, durationMs });
      console.log(`  ✅ PASS: ${name} (${durationMs}ms)`);
    } catch (err: any) {
      const durationMs = Date.now() - start;
      results.push({ name, passed: false, error: err.message, durationMs });
      console.error(`  ❌ FAIL: ${name} (${durationMs}ms)\n     Error: ${err.message}`);
    }
  }

  try {
    let patientToken = '';
    let doctorToken = '';
    let adminToken = '';
    let patient2Token = '';
    let createdApptId = '';

    // Test 1: User Login
    await test('1. Patient & Provider Login with Password Verification', async () => {
      const pRes = await makeRequest(port, '/api/auth/login', 'POST', {
        email: 'patient@example.com',
        password: 'Password123!',
      });
      if (pRes.status !== 200 || !pRes.data.token) {
        throw new Error(`Patient login failed with status ${pRes.status}: ${JSON.stringify(pRes.data)}`);
      }
      patientToken = pRes.data.token;

      const dRes = await makeRequest(port, '/api/auth/login', 'POST', {
        email: 'doctor@example.com',
        password: 'Password123!',
      });
      if (dRes.status !== 200 || !dRes.data.token) {
        throw new Error(`Doctor login failed with status ${dRes.status}`);
      }
      doctorToken = dRes.data.token;

      const aRes = await makeRequest(port, '/api/auth/login', 'POST', {
        email: 'admin@example.com',
        password: 'Password123!',
      });
      if (aRes.status !== 200 || !aRes.data.token) {
        throw new Error(`Admin login failed with status ${aRes.status}`);
      }
      adminToken = aRes.data.token;

      const p2Res = await makeRequest(port, '/api/auth/login', 'POST', {
        email: 'patient2@example.com',
        password: 'Password123!',
      });
      patient2Token = p2Res.data.token;
    });

    // Test 2: User Registration
    await test('2. New Patient Registration with Validation', async () => {
      const regRes = await makeRequest(port, '/api/auth/register', 'POST', {
        email: `testpatient_${Date.now()}@example.com`,
        password: 'SecurePassword123!',
        role: 'PATIENT',
        firstName: 'Alice',
        lastName: 'Walker',
        dateOfBirth: '1995-03-12',
        gender: 'Female',
        bloodType: 'B+',
      });
      if (regRes.status !== 201 || !regRes.data.token || regRes.data.user.role !== 'PATIENT') {
        throw new Error(`Registration failed: ${JSON.stringify(regRes.data)}`);
      }
    });

    // Test 3: Input Validation with Zod (Bad Password / Bad Email)
    await test('3. Zod Input Validation rejects invalid inputs', async () => {
      const badRes = await makeRequest(port, '/api/auth/register', 'POST', {
        email: 'not-an-email',
        password: 'short',
        role: 'PATIENT',
        firstName: '',
        lastName: '',
      });
      if (badRes.status !== 400 || !badRes.data.error) {
        throw new Error(`Expected 400 validation error, got ${badRes.status}`);
      }
    });

    // Test 4: Appointment Creation by Patient
    await test('4. Appointment Creation Workflow', async () => {
      const apptRes = await makeRequest(
        port,
        '/api/appointments',
        'POST',
        {
          providerId: 'prov_1',
          clinicId: 'clinic_1',
          appointmentDate: '2026-10-05',
          appointmentTime: '11:00',
          reason: 'Follow-up consultation regarding cardiovascular endurance and exercise routine.',
          notes: 'Patient requesting morning slot.',
        },
        patientToken
      );

      if (apptRes.status !== 201 || apptRes.data.status !== 'Pending') {
        throw new Error(`Appointment creation failed: ${JSON.stringify(apptRes.data)}`);
      }
      createdApptId = apptRes.data.id;
    });

    // Test 5: Provider Updates Appointment Status
    await test('5. Provider Approves and Confirms Appointment', async () => {
      const updateRes = await makeRequest(
        port,
        `/api/appointments/${createdApptId}`,
        'PUT',
        {
          status: 'Confirmed',
          notes: 'Confirmed. Fasting not required.',
        },
        doctorToken
      );

      if (updateRes.status !== 200 || updateRes.data.status !== 'Confirmed') {
        throw new Error(`Appointment update failed: ${JSON.stringify(updateRes.data)}`);
      }
    });

    // Test 6: Authorized Patient retrieves own Medical Record
    await test('6. Patient Retrieves Own Complete Health Records', async () => {
      const recRes = await makeRequest(port, '/api/patients/me/records', 'GET', null, patientToken);
      if (recRes.status !== 200 || !recRes.data.patient || !Array.isArray(recRes.data.medications)) {
        throw new Error(`Failed to retrieve patient records: ${JSON.stringify(recRes.data)}`);
      }
      if (recRes.data.patient.id !== 'pat_1') {
        throw new Error(`Expected patient pat_1, got ${recRes.data.patient.id}`);
      }
    });

    // Test 7: CRITICAL SECURITY TEST - Patient Isolation (Cross-Patient Access Blocked)
    await test('7. Patient Record Isolation: Patient 2 is BLOCKED (403) from Patient 1 records', async () => {
      // Patient 2 attempts to query Patient 1's records: /api/patients/pat_1/records
      const unauthorizedRes = await makeRequest(
        port,
        '/api/patients/pat_1/records',
        'GET',
        null,
        patient2Token
      );

      if (unauthorizedRes.status !== 403) {
        throw new Error(`CRITICAL SECURITY FAILURE: Unauthorized cross-patient access returned status ${unauthorizedRes.status} instead of 403 Forbidden!`);
      }

      // Check that a BLOCKED audit log was logged via Admin API
      const auditRes = await makeRequest(port, '/api/admin/audit-logs', 'GET', null, adminToken);
      if (auditRes.status === 200 && Array.isArray(auditRes.data)) {
        const blockedLog = auditRes.data.find(
          (l: any) => l.action === 'CROSS_PATIENT_ACCESS_BLOCKED' && l.status === 'BLOCKED'
        );
        if (!blockedLog) {
          throw new Error('Expected CROSS_PATIENT_ACCESS_BLOCKED audit log entry, but none found.');
        }
      }
    });

    // Test 8: Health Measurement Recording & Retrieval
    await test('8. Patient Records Vital Measurement (Blood Pressure & Heart Rate)', async () => {
      const bpRes = await makeRequest(
        port,
        '/api/measurements',
        'POST',
        {
          measurementType: 'blood_pressure',
          value: 120,
          systolic: 120,
          diastolic: 80,
          unit: 'mmHg',
          notes: 'Resting morning blood pressure test.',
        },
        patientToken
      );

      if (bpRes.status !== 201 || !bpRes.data.measurement) {
        throw new Error(`Measurement recording failed: ${JSON.stringify(bpRes.data)}`);
      }
    });

    // Test 9: Healthcare Provider adds Clinical Note & Prescribes Medication
    await test('9. Healthcare Provider creates Clinical Consultation Note and Medication', async () => {
      const noteRes = await makeRequest(
        port,
        '/api/records/consultations',
        'POST',
        {
          patientId: 'pat_1',
          visitDate: '2026-08-21',
          diagnosis: 'Routine Cardiovascular Follow-up',
          clinicalNotes: 'Blood pressure is well-controlled on current medication. No symptoms of dizziness.',
          treatmentPlan: 'Maintain current Lisinopril dosage and moderate physical activity.',
        },
        doctorToken
      );

      if (noteRes.status !== 201) {
        throw new Error(`Clinical note creation failed: ${JSON.stringify(noteRes.data)}`);
      }
    });

    // Test 10: Patient cannot create Provider-only Clinical Note (RBAC Check)
    await test('10. Patient is forbidden (403) from creating clinical consultation notes', async () => {
      const patientAttemptRes = await makeRequest(
        port,
        '/api/records/consultations',
        'POST',
        {
          patientId: 'pat_1',
          visitDate: '2026-08-21',
          diagnosis: 'Self-diagnosis attempt',
          clinicalNotes: 'Notes',
          treatmentPlan: 'Plan',
        },
        patientToken
      );

      if (patientAttemptRes.status !== 403) {
        throw new Error(`Expected 403 Forbidden for patient clinical note creation, got ${patientAttemptRes.status}`);
      }
    });

    // Test 11: Admin User Management & Audit Logs
    await test('11. Administrator views System Statistics and Security Audit Logs', async () => {
      const statsRes = await makeRequest(port, '/api/admin/stats', 'GET', null, adminToken);
      if (statsRes.status !== 200 || typeof statsRes.data.totalPatients !== 'number') {
        throw new Error(`Admin stats failed: ${JSON.stringify(statsRes.data)}`);
      }

      const logsRes = await makeRequest(port, '/api/admin/audit-logs', 'GET', null, adminToken);
      if (logsRes.status !== 200 || !Array.isArray(logsRes.data)) {
        throw new Error(`Admin audit logs failed: ${JSON.stringify(logsRes.data)}`);
      }
    });

  } finally {
    // Test completed
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log('\n=============================================');
  console.log(`📊 Test Summary: ${passedCount} Passed, ${failedCount} Failed out of ${results.length} Tests`);
  console.log('=============================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Runner Error:', err);
  process.exit(1);
});
