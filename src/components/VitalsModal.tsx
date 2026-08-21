import React, { useState } from 'react';
import { Heart, Activity, AlertCircle, X, CheckCircle } from 'lucide-react';
import { api } from '../services/api.js';

interface VitalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const VitalsModal: React.FC<VitalsModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [measurementType, setMeasurementType] = useState<string>('blood_pressure');
  const [systolic, setSystolic] = useState('120');
  const [diastolic, setDiastolic] = useState('80');
  const [singleValue, setSingleValue] = useState('72');
  const [unit, setUnit] = useState('mmHg');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTypeChange = (type: string) => {
    setMeasurementType(type);
    if (type === 'blood_pressure') {
      setUnit('mmHg');
    } else if (type === 'heart_rate') {
      setUnit('bpm');
      setSingleValue('72');
    } else if (type === 'temperature') {
      setUnit('°C');
      setSingleValue('36.6');
    } else if (type === 'weight') {
      setUnit('kg');
      setSingleValue('65');
    } else if (type === 'spo2') {
      setUnit('%');
      setSingleValue('98');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      if (measurementType === 'blood_pressure') {
        await api.recordMeasurement({
          measurementType: 'blood_pressure',
          value: parseFloat(systolic),
          systolic: parseFloat(systolic),
          diastolic: parseFloat(diastolic),
          unit: 'mmHg',
          notes,
        });
      } else {
        await api.recordMeasurement({
          measurementType,
          value: parseFloat(singleValue),
          unit,
          notes,
        });
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record health measurement.');
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
          <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
            <Heart className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Record Health Vitals</h2>
            <p className="text-xs text-slate-500">Log routine biometric measurements for personal health history</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Measurement Type Picker */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Measurement Type</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'blood_pressure', label: 'Blood Pressure' },
                { id: 'heart_rate', label: 'Heart Rate' },
                { id: 'temperature', label: 'Temperature' },
                { id: 'weight', label: 'Weight' },
                { id: 'spo2', label: 'SpO2 Oxygen' },
              ].map((t) => (
                <button
                  type="button"
                  key={t.id}
                  onClick={() => handleTypeChange(t.id)}
                  className={`p-2 rounded-xl text-center font-semibold transition-colors cursor-pointer text-[11px] ${
                    measurementType === t.id
                      ? 'bg-teal-600 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Value Inputs */}
          {measurementType === 'blood_pressure' ? (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Systolic (mmHg)</label>
                <input
                  type="number"
                  required
                  value={systolic}
                  onChange={(e) => setSystolic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Diastolic (mmHg)</label>
                <input
                  type="number"
                  required
                  value={diastolic}
                  onChange={(e) => setDiastolic(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="font-semibold text-slate-700 block mb-1">
                Value ({unit})
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={singleValue}
                onChange={(e) => setSingleValue(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm"
              />
            </div>
          )}

          {/* Context Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Notes / Context (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Measured after morning exercise, seated position"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              id="save-vitals-btn"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Measurement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
