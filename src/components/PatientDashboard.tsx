import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Heart,
  Pill,
  PlusCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ChevronRight,
  Activity,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import type { Appointment, Medication, HealthArticle, PatientProfile } from '../types/index.js';

interface PatientDashboardProps {
  onNavigate: (tab: string) => void;
  openBookingModal: () => void;
  openVitalsModal: () => void;
  openAiAssistant: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  onNavigate,
  openBookingModal,
  openVitalsModal,
  openAiAssistant,
}) => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const patient = profile as PatientProfile | null;

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [vitalStats, setVitalStats] = useState<any>(null);
  const [featuredArticles, setFeaturedArticles] = useState<HealthArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [appts, recs, stats, arts] = await Promise.all([
          api.getAppointments().catch(() => []),
          api.getPatientRecords().catch(() => ({ medications: [] })),
          api.getMeasurementStats().catch(() => null),
          api.getArticles().catch(() => ({ articles: [] })),
        ]);

        setAppointments(appts);
        setMedications(recs.medications || []);
        setVitalStats(stats);
        setFeaturedArticles(arts.articles?.slice(0, 2) || []);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const upcomingAppointment = appointments
    .filter((a) => a.status === 'Confirmed' || a.status === 'Pending')
    .sort((a, b) => new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime())[0];

  const activeMedications = medications.filter((m) => m.status === 'Active');

  return (
    <div className="space-y-6">
      {/* Patient Welcome Hero */}
      <div className="bg-linear-to-r from-teal-900 via-teal-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-teal-800/80 border border-teal-700 text-teal-200 text-xs font-semibold rounded-full mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Secure Patient Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Welcome back, {patient ? patient.firstName : 'Patient'}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-teal-100/90 leading-relaxed">
            Manage your personal healthcare records, track daily vitals, and connect seamlessly with your medical team.
          </p>

          {/* Quick Action Pills */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={openBookingModal}
              id="patient-hero-book-btn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-teal-900 font-semibold rounded-xl text-xs sm:text-sm hover:bg-teal-50 transition-colors shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-teal-700" />
              <span>{t('bookAppointment')}</span>
            </button>

            <button
              onClick={openVitalsModal}
              id="patient-hero-vitals-btn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-700/80 hover:bg-teal-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors border border-teal-600 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-teal-200" />
              <span>{t('recordVitals')}</span>
            </button>

            <button
              onClick={openAiAssistant}
              id="patient-hero-ai-btn"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-800 text-teal-200 font-semibold rounded-xl text-xs sm:text-sm transition-colors border border-teal-800 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-teal-400" />
              <span>Ask AI Guide</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-teal-500/10 blur-3xl pointer-events-none"></div>
      </div>

      {/* Grid of Key Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Next Appointment Card */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
                  <Calendar className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Upcoming Visit</h3>
              </div>
              {upcomingAppointment && (
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${
                    upcomingAppointment.status === 'Confirmed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}
                >
                  {upcomingAppointment.status}
                </span>
              )}
            </div>

            {upcomingAppointment ? (
              <div className="space-y-2 mt-2">
                <p className="text-base font-bold text-slate-900">{upcomingAppointment.reason}</p>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      {upcomingAppointment.appointmentDate} at {upcomingAppointment.appointmentTime}
                    </span>
                  </div>
                  <p className="text-slate-500">{upcomingAppointment.providerName}</p>
                  <p className="text-slate-400">{upcomingAppointment.clinicName}</p>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-slate-500">
                <p>No upcoming appointments scheduled.</p>
                <button
                  onClick={openBookingModal}
                  className="mt-2 text-teal-600 font-semibold hover:underline cursor-pointer"
                >
                  Book your next checkup &rarr;
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('appointments')}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
          >
            <span>View All Appointments</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Latest Health Vitals Summary */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-700">
                  <Heart className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Latest Vitals</h3>
              </div>
              <button
                onClick={openVitalsModal}
                className="text-xs text-teal-600 hover:underline font-semibold cursor-pointer"
              >
                + Log
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Blood Pressure</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {vitalStats?.latest?.bloodPressure || '120/80 mmHg'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Heart Rate</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {vitalStats?.latest?.heartRate || '72 bpm'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Oxygen (SpO2)</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {vitalStats?.latest?.spo2 || '98 %'}
                </span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-[11px] font-medium text-slate-500 block">Weight</span>
                <span className="text-sm font-bold text-slate-900 block mt-0.5">
                  {vitalStats?.latest?.weight || '64 kg'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onNavigate('monitoring')}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
          >
            <span>View Vital Trends & Graphs</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Active Medications */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
                  <Pill className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Active Prescriptions</h3>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                {activeMedications.length} active
              </span>
            </div>

            <div className="space-y-2 mt-2">
              {activeMedications.length === 0 ? (
                <p className="text-xs text-slate-500 py-4 text-center">No active prescriptions listed.</p>
              ) : (
                activeMedications.slice(0, 2).map((med) => (
                  <div key={med.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs">
                    <div className="flex items-center justify-between font-semibold text-slate-900">
                      <span>{med.name}</span>
                      <span className="text-teal-700 font-mono text-[11px]">{med.dosage}</span>
                    </div>
                    <p className="text-slate-500 mt-0.5 text-[11px]">{med.frequency}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigate('records')}
            className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-teal-600 hover:text-teal-700 cursor-pointer"
          >
            <span>View Full Health Records</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Featured Health Education Section */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Health Education & Preventive Care</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical articles to support your everyday wellness.
            </p>
          </div>
          <button
            onClick={() => onNavigate('education')}
            className="text-xs font-semibold text-teal-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All Articles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {featuredArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => onNavigate('education')}
              className="bg-white p-4 rounded-xl border border-slate-200/60 hover:border-teal-300 transition-all hover:shadow-xs cursor-pointer"
            >
              <span className="px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-bold rounded uppercase">
                {art.category}
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-2 leading-snug">{art.title}</h4>
              <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{art.summary}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                <span>By {art.author}</span>
                <span>{art.readTime}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
