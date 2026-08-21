import React, { useState } from 'react';
import { FileText, X, AlertCircle, CheckCircle, Stethoscope } from 'lucide-react';
import { api } from '../services/api.js';

interface ClinicalNoteModalProps {
  isOpen: boolean;
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ClinicalNoteModal: React.FC<ClinicalNoteModalProps> = ({
  isOpen,
  patientId,
  onClose,
  onSuccess,
}) => {
  const [diagnosis, setDiagnosis] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createMedicalRecord({
        patientId,
        diagnosis,
        clinicalNotes,
        treatmentPlan,
        visitDate: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save clinical consultation record.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
            <Stethoscope className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Add Clinical Consultation Note</h2>
            <p className="text-xs text-slate-500">Record physician findings, diagnosis, and care plan</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Clinical Diagnosis / Impression</label>
            <input
              type="text"
              required
              placeholder="e.g. Stage 1 Essential Hypertension, Sinusitis"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Detailed Clinical Notes & Examination Findings</label>
            <textarea
              rows={3}
              required
              placeholder="Patient presents with..."
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Treatment Plan & Follow-up Instructions</label>
            <textarea
              rows={2}
              required
              placeholder="Prescribed lifestyle adjustments, repeat blood pressure in 2 weeks..."
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving Note...' : 'Save Clinical Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
