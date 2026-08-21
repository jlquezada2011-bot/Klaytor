import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  UserCheck,
  CheckCircle,
  XCircle,
  FilePlus,
  Pill,
  FlaskConical,
  Users,
  Search,
  ChevronRight,
  ShieldCheck,
  Stethoscope,
  Building,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { api } from '../services/api.js';
import type { Appointment, ProviderProfile, PatientProfile } from '../types/index.js';

interface ProviderDashboardProps {
  onNavigate: (tab: string, patientId?: string) => void;
  openClinicalNoteModal: (patientId: string) => void;
  openPrescribeModal: (patientId: string) => void;
  openLabModal: (patientId: string) => void;
}

export const ProviderDashboard: React.FC<ProviderDashboardProps> = ({
  onNavigate,
  openClinicalNoteModal,
  openPrescribeModal,
  openLabModal,
}) => {
  const { user, profile } = useAuth();
  const provider = profile as ProviderProfile | null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPatient, setSearchPatient] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [appts, allPatients] = await Promise.all([
        api.getAppointments().catch(() => []),
        api.getAllPatients().catch(() => []),
      ]);
      setAppointments(appts);
      setPatients(allPatients);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await api.updateAppointment(id, { status: newStatus });
      setActionSuccess(`Appointment status successfully updated to ${newStatus}.`);
      setTimeout(() => setActionSuccess(null), 4000);
      loadData();
    } catch (err: any) {
      alert(`Error updating appointment: ${err.message}`);
    }
  };

  const pendingAppointments = appointments.filter((a) => a.status === 'Pending');
  const upcomingAppointments = appointments
    .filter((a) => a.status === 'Confirmed')
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime());

  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchPatient.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchPatient.toLowerCase()) ||
      p.phone.includes(searchPatient)
  );

  return (
    <div className="space-y-6">
      {/* Provider Hero Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-950 border border-teal-800 text-teal-300 text-xs font-semibold rounded-full mb-3">
            <Stethoscope className="w-3.5 h-3.5 text-teal-400" />
            <span>Clinical Healthcare Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {provider ? `Dr. ${provider.firstName} ${provider.lastName}, ${provider.title}` : 'Healthcare Provider'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
            <span className="font-medium text-teal-300">{provider?.specialty || 'General Medicine'}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              {provider?.clinicName || 'Metro Medical Center'}
            </span>
            <span>•</span>
            <span>License: {provider?.licenseNumber || 'Verified'}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 block font-medium">Pending Requests</span>
            <span className="text-xl font-bold text-amber-400 block mt-0.5">{pendingAppointments.length}</span>
          </div>

          <div className="bg-slate-800/80 px-4 py-2.5 rounded-xl border border-slate-700 text-center">
            <span className="text-xs text-slate-400 block font-medium">Confirmed Visits</span>
            <span className="text-xl font-bold text-teal-400 block mt-0.5">{upcomingAppointments.length}</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Grid: Pending Action Queue & Today's Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approval Queue */}
        <div className="lg:col-span-2 space-y-6">
          {/* Pending Appointment Requests */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 rounded-lg text-amber-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Appointment Requests Requiring Action</h3>
                  <p className="text-xs text-slate-500">Review patient consultation requests</p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
                {pendingAppointments.length} Pending
              </span>
            </div>

            {pendingAppointments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto mb-2 opacity-80" />
                <span>All appointment requests have been processed.</span>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingAppointments.map((appt) => (
                  <div
                    key={appt.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-900">{appt.patientName || 'Patient'}</span>
                          <span className="px-2 py-0.5 bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-bold rounded-full uppercase">
                            Pending
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 font-medium mt-1">{appt.reason}</p>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {appt.appointmentDate} at {appt.appointmentTime}
                          </span>
                          <span>•</span>
                          <span>{appt.clinicName}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'Confirmed')}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Confirm</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(appt.id, 'Cancelled')}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-lg cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Schedule */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Confirmed Clinic Schedule</h3>
                  <p className="text-xs text-slate-500">Upcoming booked visits</p>
                </div>
              </div>
            </div>

            {upcomingAppointments.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No confirmed visits scheduled.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {upcomingAppointments.map((appt) => (
                  <div key={appt.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 text-sm block">{appt.patientName}</span>
                      <p className="text-slate-600 mt-0.5">{appt.reason}</p>
                      <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                        {appt.appointmentDate} • {appt.appointmentTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => openClinicalNoteModal(appt.patientId)}
                        className="px-2.5 py-1 bg-teal-50 text-teal-700 hover:bg-teal-100 font-semibold rounded text-xs cursor-pointer"
                      >
                        + Clinical Note
                      </button>
                      <button
                        onClick={() => onNavigate('records', appt.patientId)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-xs cursor-pointer"
                      >
                        Chart &rarr;
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Quick Patient Roster & Direct Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Patient Directory</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">{patients.length} patients</span>
            </div>

            {/* Patient Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search patient name..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-teal-500"
              />
            </div>

            {/* Patients List */}
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 divide-y divide-slate-100">
              {filteredPatients.map((pat) => (
                <div key={pat.id} className="pt-2 pb-1 first:pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block">
                        {pat.firstName} {pat.lastName}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        DOB: {pat.dateOfBirth} • Blood: {pat.bloodType}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('records', pat.id)}
                      className="text-xs text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
                    >
                      View Chart &rarr;
                    </button>
                  </div>

                  {/* Fast Action Buttons for this patient */}
                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => openClinicalNoteModal(pat.id)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded cursor-pointer"
                      title="Add Clinical Consultation Note"
                    >
                      + Note
                    </button>

                    <button
                      onClick={() => openPrescribeModal(pat.id)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded cursor-pointer"
                      title="Prescribe Medication"
                    >
                      + Prescribe
                    </button>

                    <button
                      onClick={() => openLabModal(pat.id)}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold rounded cursor-pointer"
                      title="Upload Lab Result"
                    >
                      + Lab
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
