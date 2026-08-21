import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, CheckCircle, AlertCircle, X } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import type { ProviderProfile, Clinic } from '../types/index.js';

interface AppointmentBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AppointmentBookingModal: React.FC<AppointmentBookingModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [providers, setProviders] = useState<ProviderProfile[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields
  const [providerId, setProviderId] = useState('');
  const [clinicId, setClinicId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('09:00');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const loadOptions = async () => {
        try {
          const [pList, cList] = await Promise.all([api.getProviders(), api.getClinics()]);
          setProviders(pList);
          setClinics(cList);
          if (pList.length > 0) setProviderId(pList[0].id);
          if (cList.length > 0) setClinicId(cList[0].id);

          // Default tomorrow
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setAppointmentDate(tomorrow.toISOString().split('T')[0]);
        } catch (err: any) {
          setError('Failed to load clinic or provider directories.');
        } finally {
          setLoading(false);
        }
      };
      loadOptions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await api.createAppointment({
        providerId,
        clinicId,
        appointmentDate,
        appointmentTime,
        reason,
        notes,
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to book appointment.');
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
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Book Medical Consultation</h2>
            <p className="text-xs text-slate-500">Schedule an appointment with a verified healthcare provider</p>
          </div>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Select Doctor / Provider */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Select Healthcare Provider</label>
            <select
              value={providerId}
              onChange={(e) => setProviderId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
            >
              {providers.map((p) => (
                <option key={p.id} value={p.id}>
                  Dr. {p.firstName} {p.lastName} — {p.specialty}
                </option>
              ))}
            </select>
          </div>

          {/* Select Clinic */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">Clinic / Facility Location</label>
            <select
              value={clinicId}
              onChange={(e) => setClinicId(e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
            >
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.address})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Date</label>
              <input
                type="date"
                required
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 block mb-1">Preferred Time</label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
              >
                <option value="08:30">08:30 AM</option>
                <option value="09:00">09:00 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="13:30">01:30 PM</option>
                <option value="14:00">02:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:30">04:30 PM</option>
              </select>
            </div>
          </div>

          {/* Reason for consultation */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Reason for Visit / Symptoms (Summary)
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Routine blood pressure checkup, flu symptoms review"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Additional Notes */}
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Additional Notes or Special Instructions (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Wheelchair assistance required, bringing prior lab tests"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-900"
            />
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              id="submit-booking-btn"
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Confirm Appointment Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
