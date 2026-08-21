import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  XCircle,
  Plus,
  Filter,
  Search,
  AlertCircle,
  Check,
  RotateCcw,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import type { Appointment } from '../types/index.js';

interface AppointmentsViewProps {
  openBookingModal: () => void;
}

export const AppointmentsView: React.FC<AppointmentsViewProps> = ({ openBookingModal }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Reschedule Modal State
  const [reschedulingAppt, setReschedulingAppt] = useState<Appointment | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('10:00');

  const loadAppointments = async () => {
    try {
      const data = await api.getAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error('Error loading appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [user]);

  const handleUpdateStatus = async (id: string, status: string, notes?: string) => {
    try {
      await api.updateAppointment(id, { status, notes });
      setActionSuccess(`Appointment status updated to ${status}.`);
      loadAppointments();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Error updating appointment: ${err.message}`);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await api.cancelAppointment(id);
      setActionSuccess('Appointment cancelled.');
      loadAppointments();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Error cancelling appointment: ${err.message}`);
    }
  };

  const handleConfirmReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reschedulingAppt) return;
    try {
      await api.updateAppointment(reschedulingAppt.id, {
        appointmentDate: newDate,
        appointmentTime: newTime,
        status: 'Rescheduled',
        notes: `Rescheduled to ${newDate} at ${newTime}`,
      });
      setReschedulingAppt(null);
      setActionSuccess('Appointment rescheduled.');
      loadAppointments();
      setTimeout(() => setActionSuccess(null), 4000);
    } catch (err: any) {
      alert(`Failed to reschedule: ${err.message}`);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    const matchesStatus = filterStatus === 'ALL' || a.status === filterStatus;
    const matchesSearch =
      a.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.providerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.clinicName?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Appointment Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Organize upcoming consultations, review past visits, and schedule care.
          </p>
        </div>

        <button
          onClick={openBookingModal}
          id="book-new-appt-btn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('bookAppointment')}</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'Pending', 'Confirmed', 'Completed', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                filterStatus === st
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              {st === 'ALL' ? 'All Visits' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search provider, reason, clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500 focus:bg-white text-xs"
          />
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500">Loading scheduled appointments...</div>
        ) : filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-xs text-slate-500">
            <Calendar className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">No appointments found matching this filter.</p>
            <button
              onClick={openBookingModal}
              className="mt-3 text-teal-600 font-semibold hover:underline cursor-pointer"
            >
              Schedule a visit now &rarr;
            </button>
          </div>
        ) : (
          filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 text-sm">{appt.reason}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      appt.status === 'Confirmed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : appt.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : appt.status === 'Completed'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
                  <span className="font-medium text-slate-900">
                    {user?.role === 'PATIENT' ? appt.providerName : `Patient: ${appt.patientName}`}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-mono text-teal-700">
                    <Clock className="w-3.5 h-3.5" />
                    {appt.appointmentDate} at {appt.appointmentTime}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-slate-500">
                    <MapPin className="w-3.5 h-3.5" />
                    {appt.clinicName}
                  </span>
                </div>

                {appt.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 mt-2">
                    <strong className="text-slate-700">Notes: </strong> {appt.notes}
                  </p>
                )}
              </div>

              {/* Action Controls */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                {user?.role === 'PROVIDER' && appt.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(appt.id, 'Confirmed')}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      Confirm Visit
                    </button>
                    <button
                      onClick={() => {
                        setReschedulingAppt(appt);
                        setNewDate(appt.appointmentDate);
                      }}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs cursor-pointer"
                    >
                      Reschedule
                    </button>
                  </>
                )}

                {user?.role === 'PROVIDER' && appt.status === 'Confirmed' && (
                  <button
                    onClick={() => handleUpdateStatus(appt.id, 'Completed')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Mark Completed
                  </button>
                )}

                {appt.status !== 'Cancelled' && appt.status !== 'Completed' && (
                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold rounded-lg text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Reschedule Modal */}
      {reschedulingAppt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Reschedule Appointment</h3>
            <p className="text-xs text-slate-500 mb-4">
              Update appointment date and time for {reschedulingAppt.patientName || 'patient'}.
            </p>

            <form onSubmit={handleConfirmReschedule} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Date</label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">New Time</label>
                <select
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:30">11:30 AM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:30">03:30 PM</option>
                </select>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setReschedulingAppt(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 cursor-pointer"
                >
                  Save Rescheduled Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
