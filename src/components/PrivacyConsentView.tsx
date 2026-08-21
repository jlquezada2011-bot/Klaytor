import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Lock, FileText, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import type { ConsentRecord } from '../types/index.js';

export const PrivacyConsentView: React.FC = () => {
  const { user } = useAuth();
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [governanceInfo, setGovernanceInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadConsent = async () => {
    try {
      const res = await api.getConsent();
      setConsentRecords(res.consentRecords);
      setGovernanceInfo(res.governanceInfo);
    } catch (err: any) {
      console.error('Error loading consent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConsent();
  }, [user]);

  const handleToggle = async (type: string, currentGranted: boolean) => {
    try {
      await api.toggleConsent(type, !currentGranted);
      setFeedback(`Consent settings for ${type.replace(/_/g, ' ')} successfully updated.`);
      loadConsent();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      alert(`Failed to update consent: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-teal-50 text-teal-800 text-xs font-bold rounded-full mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>HIPAA & Privacy Compliant Framework</span>
          </div>
          <h1 className="text-xl font-bold text-slate-900">Privacy, Consent & Data Governance</h1>
          <p className="text-xs text-slate-500 mt-1">
            You maintain full sovereignty over how your electronic health data is processed and shared.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Consent Toggles */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">User Data Consent Controls</h3>
        <p className="text-xs text-slate-500">
          Modify your preferences at any time. Changes take immediate effect and are recorded in the security audit ledger.
        </p>

        <div className="divide-y divide-slate-100 mt-2">
          {consentRecords.map((c) => (
            <div key={c.id} className="py-4 flex items-center justify-between gap-4 text-xs">
              <div>
                <span className="font-bold text-slate-900 text-sm block">
                  {c.consentType.replace(/_/g, ' ')}
                </span>
                <p className="text-slate-600 mt-0.5 leading-relaxed">{c.description}</p>
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  Version: {c.termsVersion} • Last updated: {new Date(c.updatedAt).toLocaleDateString()}
                </span>
              </div>

              <button
                onClick={() => handleToggle(c.consentType, c.granted)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  c.granted
                    ? 'bg-teal-600 text-white hover:bg-teal-700 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.granted ? 'Consent Granted' : 'Consent Revoked'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data Protection Governance Principles */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-slate-900">Data Protection Principles</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
          {governanceInfo?.dataProtectionPrinciples?.map((item: string, idx: number) => (
            <div key={idx} className="p-3 bg-white rounded-xl border border-slate-200 text-slate-700 leading-relaxed flex items-start gap-2">
              <Check className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-slate-500 pt-3 border-t border-slate-200">
          Emergency Note: {governanceInfo?.emergencyNotice || 'Consent settings do not restrict essential emergency care or statutory disease reporting required by law.'}
        </p>
      </div>
    </div>
  );
};
