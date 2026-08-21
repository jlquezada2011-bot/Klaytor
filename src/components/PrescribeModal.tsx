import React, { useState } from 'react';
import { Pill, X, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';

interface PrescribeModalProps {
  isOpen: boolean;
  patientId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const PrescribeModal: React.FC<PrescribeModalProps> = ({
  isOpen,
  patientId,
  onClose,
  onSuccess,
}) => {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily with breakfast');
  const [route, setRoute] = useState('Oral');
  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState('30 days');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.prescribeMedication({
        patientId,
        name,
        dosage,
        frequency,
        route,
        instructions: duration ? `Duration: ${duration}. ${instructions}` : instructions,
        startDate: new Date().toISOString().split('T')[0],
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to prescribe medication.');
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
          <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Prescribe Medication</h2>
            <p className="text-xs text-slate-500">Authorized electronic prescription entry</p>
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
            <label className="font-semibold text-slate-700 block mb-1">Medication Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Amlodipine, Amoxicillin, Metformin"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Dosage & Strength</label>
              <input
                type="text"
                required
                placeholder="e.g. 5mg, 500mg"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Route of Administration</label>
              <select
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
              >
                <option value="Oral">Oral (PO)</option>
                <option value="Sublingual">Sublingual</option>
                <option value="Inhalation">Inhalation</option>
                <option value="Topical">Topical</option>
                <option value="Intramuscular">Intramuscular</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Frequency & Schedule</label>
            <input
              type="text"
              required
              placeholder="e.g. Once daily every morning, Twice daily after meals"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Duration & Special Instructions</label>
            <textarea
              rows={2}
              placeholder="e.g. Take with plenty of water. Complete full course."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
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
              {submitting ? 'Prescribing...' : 'Issue Prescription'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
