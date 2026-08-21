import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LanguageProvider, useLanguage } from './context/LanguageContext.js';
import { EmergencyBanner } from './components/EmergencyBanner.js';
import { Navbar } from './components/Navbar.js';
import { PatientDashboard } from './components/PatientDashboard.js';
import { ProviderDashboard } from './components/ProviderDashboard.js';
import { AdminDashboard } from './components/AdminDashboard.js';
import { AppointmentsView } from './components/AppointmentsView.js';
import { PatientRecordsView } from './components/PatientRecordsView.js';
import { HealthMonitoringView } from './components/HealthMonitoringView.js';
import { HealthEducationView } from './components/HealthEducationView.js';
import { PrivacyConsentView } from './components/PrivacyConsentView.js';
import { MessagesView } from './components/MessagesView.js';
import { AppointmentBookingModal } from './components/AppointmentBookingModal.js';
import { VitalsModal } from './components/VitalsModal.js';
import { AIAssistantModal } from './components/AIAssistantModal.js';
import { SearchModal } from './components/SearchModal.js';
import { AuthModal } from './components/AuthModal.js';
import { ClinicalNoteModal } from './components/ClinicalNoteModal.js';
import { PrescribeModal } from './components/PrescribeModal.js';
import { LabResultModal } from './components/LabResultModal.js';
import {
  Calendar,
  FileText,
  Activity,
  BookOpen,
  MessageSquare,
  Shield,
  Bot,
  LayoutDashboard,
  ShieldAlert,
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | undefined>(undefined);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Clinical Entry Modals
  const [clinicalNotePatientId, setClinicalNotePatientId] = useState<string | null>(null);
  const [prescribePatientId, setPrescribePatientId] = useState<string | null>(null);
  const [labResultPatientId, setLabResultPatientId] = useState<string | null>(null);

  const handleNavigate = (tab: string, patientId?: string) => {
    setActiveTab(tab);
    if (patientId) {
      setSelectedPatientId(patientId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Universal Emergency Medical Banner */}
      <EmergencyBanner />

      {/* Main Top Header Navbar */}
      <Navbar
        onOpenSearch={() => setIsSearchModalOpen(true)}
        onOpenAi={() => setIsAiModalOpen(true)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={handleNavigate}
      />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Navigation Tabs Bar */}
        <div className="mb-6 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1 overflow-x-auto">
          <button
            onClick={() => handleNavigate('dashboard')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'dashboard'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>{t('dashboard')}</span>
          </button>

          <button
            onClick={() => handleNavigate('appointments')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>{t('appointments')}</span>
          </button>

          <button
            onClick={() => handleNavigate('records')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'records'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('healthRecords')}</span>
          </button>

          <button
            onClick={() => handleNavigate('monitoring')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'monitoring'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Vitals Tracker</span>
          </button>

          <button
            onClick={() => handleNavigate('education')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'education'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{t('healthEducation')}</span>
          </button>

          <button
            onClick={() => handleNavigate('messages')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'messages'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Messages</span>
          </button>

          <button
            onClick={() => handleNavigate('privacy')}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Privacy & Consent</span>
          </button>

          {user?.role === 'ADMIN' && (
            <button
              onClick={() => handleNavigate('admin')}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'admin'
                  ? 'bg-purple-700 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Admin Governance</span>
            </button>
          )}
        </div>

        {/* Tab Views */}
        {activeTab === 'dashboard' && (
          <>
            {user?.role === 'PROVIDER' ? (
              <ProviderDashboard
                onNavigate={handleNavigate}
                openClinicalNoteModal={(pId) => setClinicalNotePatientId(pId)}
                openPrescribeModal={(pId) => setPrescribePatientId(pId)}
                openLabModal={(pId) => setLabResultPatientId(pId)}
              />
            ) : user?.role === 'ADMIN' ? (
              <AdminDashboard />
            ) : (
              <PatientDashboard
                onNavigate={handleNavigate}
                openBookingModal={() => setIsBookingModalOpen(true)}
                openVitalsModal={() => setIsVitalsModalOpen(true)}
              />
            )}
          </>
        )}

        {activeTab === 'appointments' && (
          <AppointmentsView openBookingModal={() => setIsBookingModalOpen(true)} />
        )}

        {activeTab === 'records' && (
          <PatientRecordsView
            patientId={selectedPatientId}
            openClinicalNoteModal={(pId) => setClinicalNotePatientId(pId)}
            openPrescribeModal={(pId) => setPrescribePatientId(pId)}
            openLabModal={(pId) => setLabResultPatientId(pId)}
          />
        )}

        {activeTab === 'monitoring' && (
          <HealthMonitoringView openVitalsModal={() => setIsVitalsModalOpen(true)} />
        )}

        {activeTab === 'education' && <HealthEducationView />}

        {activeTab === 'messages' && <MessagesView />}

        {activeTab === 'privacy' && <PrivacyConsentView />}

        {activeTab === 'admin' && <AdminDashboard />}
      </main>

      {/* Modals */}
      <AppointmentBookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSuccess={() => setActiveTab('appointments')}
      />

      <VitalsModal
        isOpen={isVitalsModalOpen}
        onClose={() => setIsVitalsModalOpen(false)}
        onSuccess={() => setActiveTab('monitoring')}
      />

      <AIAssistantModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />

      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      {clinicalNotePatientId && (
        <ClinicalNoteModal
          isOpen={!!clinicalNotePatientId}
          patientId={clinicalNotePatientId}
          onClose={() => setClinicalNotePatientId(null)}
          onSuccess={() => {
            setSelectedPatientId(clinicalNotePatientId);
            setActiveTab('records');
          }}
        />
      )}

      {prescribePatientId && (
        <PrescribeModal
          isOpen={!!prescribePatientId}
          patientId={prescribePatientId}
          onClose={() => setPrescribePatientId(null)}
          onSuccess={() => {
            setSelectedPatientId(prescribePatientId);
            setActiveTab('records');
          }}
        />
      )}

      {labResultPatientId && (
        <LabResultModal
          isOpen={!!labResultPatientId}
          patientId={labResultPatientId}
          onClose={() => setLabResultPatientId(null)}
          onSuccess={() => {
            setSelectedPatientId(labResultPatientId);
            setActiveTab('records');
          }}
        />
      )}

      {/* Floating AI Health Assistant Trigger */}
      <button
        onClick={() => setIsAiModalOpen(true)}
        className="fixed bottom-6 right-6 z-40 p-3.5 bg-teal-600 hover:bg-teal-700 text-white rounded-2xl shadow-xl flex items-center gap-2 text-xs font-bold transition-transform hover:scale-105 cursor-pointer border border-teal-500"
        title="Open AI Health Assistant"
      >
        <Bot className="w-5 h-5" />
        <span className="hidden sm:inline">AI Health Guide</span>
      </button>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Klaytor Digital Health Platform</span>
            <span>•</span>
            <span>Secure Electronic Health Records & Clinical Consultations</span>
          </div>

          <div className="text-[11px] text-slate-400 text-center sm:text-right">
            <span>Non-Emergency Platform • For life-threatening symptoms, dial local emergency services immediately</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}
