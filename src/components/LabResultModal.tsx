import React, { useState } from 'react';
import { FlaskConical, X, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';

interface LabResultModalProps {
  isOpen: boolean;
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const LabResultModal: React.FC<LabResultModalProps> = ({
  isOpen,
  patientId,
  onClose,
  onSuccess,
}) => {
  const [testName, setTestName] = useState('Lipid Profile (Total Cholesterol)');
  const [testCategory, setTestCategory] = useState('Chemistry');
  const [resultValue, setResultValue] = useState('185');
  const [unit, setUnit] = useState('mg/dL');
  const [referenceRange, setReferenceRange] = useState('< 200 mg/dL');
  const [status, setStatus] = useState<'Normal' | 'Abnormal' | 'Critical'>('Normal');
  const [interpretation, setInterpretation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createLabResult({
        patientId,
        testName,
        testCategory,
        resultValue,
        unit,
        referenceRange,
        status,
        interpretation,
        testDate: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record diagnostic lab result.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Upload Diagnostic Lab Result</h2>
            <p className="text-xs text-slate-500">Record structured laboratory findings for the patient</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Diagnostic Test Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Fasting Blood Glucose, Complete Blood Count, HbA1c"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Category</label>
              <select
                value={testCategory}
                onChange={(e) => setTestCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="Chemistry">Chemistry</option>
                <option value="Hematology">Hematology</option>
                <option value="Microbiology">Microbiology</option>
                <option value="Immunology">Immunology</option>
                <option value="Urinalysis">Urinalysis</option>
                <option value="Pathology">Pathology</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Result Evaluation</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="Normal">Normal</option>
                <option value="Abnormal">Abnormal</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Value</label>
              <input
                type="text"
                required
                placeholder="e.g. 95"
                value={resultValue}
                onChange={(e) => setResultValue(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Unit</label>
              <input
                type="text"
                placeholder="mg/dL, %"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Ref Range</label>
              <input
                type="text"
                placeholder="70 - 99"
                value={referenceRange}
                onChange={(e) => setReferenceRange(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Physician Interpretation / Notes</label>
            <textarea
              rows={2}
              placeholder="e.g. Findings are within optimal standard reference limits."
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Uploading...' : 'Save Diagnostic Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
