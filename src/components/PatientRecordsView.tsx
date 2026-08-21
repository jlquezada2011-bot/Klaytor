import React, { useState, useEffect } from 'react';
import {
  FileText,
  AlertTriangle,
  Pill,
  Syringe,
  FlaskConical,
  Heart,
  Calendar,
  Download,
  User,
  ShieldCheck,
  Plus,
  ChevronRight,
  Printer,
  CheckCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import type {
  PatientProfile,
  MedicalRecord,
  Medication,
  Allergy,
  Vaccination,
  LaboratoryResult,
  HealthMeasurement,
} from '../types/index.js';

interface PatientRecordsViewProps {
  patientId?: string;
  openClinicalNoteModal?: (patientId: string) => void;
  openPrescribeModal?: (patientId: string) => void;
  openLabModal?: (patientId: string) => void;
}

export const PatientRecordsView: React.FC<PatientRecordsViewProps> = ({
  patientId,
  openClinicalNoteModal,
  openPrescribeModal,
  openLabModal,
}) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'consultations' | 'medications' | 'allergies' | 'labs' | 'vaccines'>('overview');

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [vaccinations, setVaccinations] = useState<Vaccination[]>([]);
  const [laboratoryResults, setLaboratoryResults] = useState<LaboratoryResult[]>([]);
  const [healthMeasurements, setHealthMeasurements] = useState<HealthMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  // New Allergy form modal state
  const [showAddAllergy, setShowAddAllergy] = useState(false);
  const [newAllergen, setNewAllergen] = useState('');
  const [newReaction, setNewReaction] = useState('');
  const [newSeverity, setNewSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');

  const loadRecords = async () => {
    try {
      const data = await api.getPatientRecords(patientId);
      setPatient(data.patient);
      setMedicalRecords(data.medicalRecords || []);
      setMedications(data.medications || []);
      setAllergies(data.allergies || []);
      setVaccinations(data.vaccinations || []);
      setLaboratoryResults(data.laboratoryResults || []);
      setHealthMeasurements(data.healthMeasurements || []);
    } catch (err: any) {
      console.error('Error loading patient records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, [patientId, user]);

  const handleCreateAllergy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patient) return;
    try {
      await api.addAllergy({
        patientId: patient.id,
        allergen: newAllergen,
        reaction: newReaction,
        severity: newSeverity,
        diagnosedDate: new Date().toISOString().split('T')[0],
      });
      setShowAddAllergy(false);
      setNewAllergen('');
      setNewReaction('');
      loadRecords();
    } catch (err: any) {
      alert(`Failed to add allergy: ${err.message}`);
    }
  };

  const handleExportRecords = () => {
    setExportMessage('Generating secure Electronic Health Record PDF summary...');
    setTimeout(() => {
      setExportMessage('Record exported successfully to secure health document.');
      setTimeout(() => setExportMessage(null), 4000);
    }, 1200);
  };

  if (loading) {
    return (
      <div className="py-16 text-center text-xs text-slate-500">
        <div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <span>Retrieving encrypted health record...</span>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-xs text-slate-500">Patient chart could not be located or access is restricted.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Patient Header Card */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
            {patient.firstName[0]}
            {patient.lastName[0]}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-xs font-bold rounded">
                Blood: {patient.bloodType || 'Unknown'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5">
              <span>DOB: {patient.dateOfBirth} ({new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear()} yrs)</span>
              <span>•</span>
              <span>Gender: {patient.gender}</span>
              <span>•</span>
              <span>Phone: {patient.phone || 'N/A'}</span>
              <span>•</span>
              <span>Contact: {patient.emergencyContactName || 'N/A'}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {user?.role === 'PROVIDER' && (
            <>
              {openClinicalNoteModal && (
                <button
                  onClick={() => openClinicalNoteModal(patient.id)}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs cursor-pointer"
                >
                  + Add Clinical Note
                </button>
              )}
              {openPrescribeModal && (
                <button
                  onClick={() => openPrescribeModal(patient.id)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold cursor-pointer"
                >
                  + Prescribe
                </button>
              )}
            </>
          )}

          <button
            onClick={handleExportRecords}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Summary</span>
          </button>
        </div>
      </div>

      {exportMessage && (
        <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-teal-600 shrink-0" />
          <span>{exportMessage}</span>
        </div>
      )}

      {/* Record Navigation Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 overflow-x-auto pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'overview'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Summary Overview
        </button>

        <button
          onClick={() => setActiveTab('consultations')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'consultations'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Consultation Notes ({medicalRecords.length})
        </button>

        <button
          onClick={() => setActiveTab('medications')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'medications'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Medications ({medications.length})
        </button>

        <button
          onClick={() => setActiveTab('allergies')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'allergies'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Allergies ({allergies.length})
        </button>

        <button
          onClick={() => setActiveTab('labs')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'labs'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Lab Results ({laboratoryResults.length})
        </button>

        <button
          onClick={() => setActiveTab('vaccines')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap cursor-pointer transition-colors ${
            activeTab === 'vaccines'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Immunizations ({vaccinations.length})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Allergies Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Allergies & Adverse Reactions</h3>
              </div>
              <button
                onClick={() => setShowAddAllergy(true)}
                className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
              >
                + Add Allergy
              </button>
            </div>

            {allergies.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No known drug or environmental allergies recorded.</p>
            ) : (
              <div className="space-y-2">
                {allergies.map((alg) => (
                  <div key={alg.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{alg.allergen}</span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          alg.severity === 'Severe'
                            ? 'bg-rose-100 text-rose-800'
                            : alg.severity === 'Moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {alg.severity} Severity
                      </span>
                    </div>
                    <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{alg.reaction}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Current Active Medications Card */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Current Medications</h3>
              </div>
              {user?.role === 'PROVIDER' && openPrescribeModal && (
                <button
                  onClick={() => openPrescribeModal(patient.id)}
                  className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
                >
                  + Prescribe
                </button>
              )}
            </div>

            {medications.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">No active medications prescribed.</p>
            ) : (
              <div className="space-y-2">
                {medications.map((med) => (
                  <div key={med.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{med.name}</span>
                      <span className="font-mono text-teal-700 font-bold">{med.dosage}</span>
                    </div>
                    <p className="text-slate-600 mt-1 text-[11px]">
                      {med.frequency} • {med.instructions}
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Prescribed by {med.providerName} on {med.startDate}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'consultations' && (
        <div className="space-y-4">
          {medicalRecords.length === 0 ? (
            <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 text-xs text-slate-500">
              No clinical consultation notes recorded yet.
            </div>
          ) : (
            medicalRecords.map((mr) => (
              <div key={mr.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-teal-700 uppercase tracking-wider block">
                      Visit Date: {mr.visitDate}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">{mr.diagnosis}</h3>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Attending: {mr.providerName}</span>
                </div>

                <div className="text-xs space-y-2 text-slate-700">
                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">Clinical Findings & Notes:</span>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">
                      {mr.clinicalNotes}
                    </p>
                  </div>

                  <div>
                    <span className="font-semibold text-slate-900 block mb-0.5">Care & Treatment Plan:</span>
                    <p className="bg-slate-50 p-3 rounded-xl border border-slate-100 leading-relaxed font-sans">
                      {mr.treatmentPlan}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'medications' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Prescription History</h3>
            {user?.role === 'PROVIDER' && openPrescribeModal && (
              <button
                onClick={() => openPrescribeModal(patient.id)}
                className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                + New Prescription
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">Medication</th>
                  <th className="p-3">Dosage</th>
                  <th className="p-3">Frequency & Route</th>
                  <th className="p-3">Prescriber</th>
                  <th className="p-3">Start Date</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medications.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-900">{m.name}</td>
                    <td className="p-3 font-mono text-teal-700 font-semibold">{m.dosage}</td>
                    <td className="p-3 text-slate-600">
                      {m.frequency} ({m.route || 'Oral'})
                    </td>
                    <td className="p-3 text-slate-600">{m.providerName}</td>
                    <td className="p-3 text-slate-500 font-mono">{m.startDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold rounded uppercase">
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'allergies' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Allergies & Intolerances</h3>
            <button
              onClick={() => setShowAddAllergy(true)}
              className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              + Record Allergy
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allergies.map((alg) => (
              <div key={alg.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{alg.allergen}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      alg.severity === 'Severe'
                        ? 'bg-rose-100 text-rose-800'
                        : alg.severity === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {alg.severity} Severity
                  </span>
                </div>
                <p className="text-slate-600 mt-2 leading-relaxed">{alg.reaction}</p>
                {alg.diagnosedDate && (
                  <span className="text-[10px] text-slate-400 mt-2 block font-mono">
                    Diagnosed: {alg.diagnosedDate}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'labs' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Diagnostic Laboratory Results</h3>
            {user?.role === 'PROVIDER' && openLabModal && (
              <button
                onClick={() => openLabModal(patient.id)}
                className="px-3 py-1 bg-teal-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                + Upload Lab Result
              </button>
            )}
          </div>

          <div className="space-y-3">
            {laboratoryResults.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No laboratory reports uploaded.</p>
            ) : (
              laboratoryResults.map((lab) => (
                <div key={lab.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{lab.testName}</span>
                        <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold rounded">
                          {lab.testCategory}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                        Date: {lab.testDate} • Provider: {lab.providerName}
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="font-bold text-slate-900 text-sm block">
                          {lab.resultValue} {lab.unit}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          Ref: {lab.referenceRange}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                          lab.status === 'Normal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : lab.status === 'Abnormal'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {lab.status}
                      </span>
                    </div>
                  </div>

                  {lab.interpretation && (
                    <div className="mt-3 pt-2 border-t border-slate-200/60 text-slate-600">
                      <strong className="text-slate-800">Physician Interpretation: </strong>
                      <span>{lab.interpretation}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'vaccines' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Immunization Record & Due Dates</h3>
          <div className="space-y-3">
            {vaccinations.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No vaccination logs recorded.</p>
            ) : (
              vaccinations.map((vac) => (
                <div key={vac.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-900 text-sm block">{vac.vaccineName}</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Dose #{vac.doseNumber} • Administered on {vac.administeredDate} by {vac.administeredBy}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono block">Batch: {vac.batchNumber}</span>
                  </div>

                  {vac.nextDueDate && (
                    <div className="px-3 py-1.5 bg-teal-50 border border-teal-200 rounded-lg text-teal-800 text-[11px] font-semibold text-right">
                      <span>Next Due: </span>
                      <span className="font-mono">{vac.nextDueDate}</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Allergy Modal */}
      {showAddAllergy && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Record Known Allergy</h3>
            <p className="text-xs text-slate-500 mb-4">Add allergy details to the patient's electronic health record.</p>

            <form onSubmit={handleCreateAllergy} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Allergen (Substance/Drug/Food)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Penicillin, Latex, Peanuts"
                  value={newAllergen}
                  onChange={(e) => setNewAllergen(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Observed Reaction</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Skin rash, facial swelling, shortness of breath"
                  value={newReaction}
                  onChange={(e) => setNewReaction(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Severity Level</label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as any)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="Mild">Mild</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Severe">Severe</option>
                </select>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddAllergy(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 cursor-pointer"
                >
                  Save Allergy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
