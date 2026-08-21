import React, { useState } from 'react';
import { AlertTriangle, Phone, ChevronDown, ChevronUp, ShieldAlert, HeartPulse } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

export const EmergencyBanner: React.FC = () => {
  const { t } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside aria-label="Medical Emergency Notice" className="bg-rose-900 text-rose-50 border-b border-rose-800 transition-all">
      <div className="max-w-7xl mx-auto px-4 py-2 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm">
          <div className="flex items-center gap-2 font-medium">
            <span className="p-1 bg-rose-800 rounded text-rose-200 shrink-0">
              <AlertTriangle className="w-4 h-4 text-rose-300" />
            </span>
            <p className="leading-snug">
              <strong className="font-semibold text-rose-200 uppercase tracking-wide mr-1">Medical Notice:</strong>
              {t('medicalDisclaimer')}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:911"
              id="emergency-call-btn"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-medium rounded text-xs transition-colors shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 animate-pulse" />
              <span>Call 911 (Emergency)</span>
            </a>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              id="emergency-expand-btn"
              className="inline-flex items-center gap-1 text-rose-300 hover:text-white text-xs underline font-medium cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Emergency Guide' : 'When to call 911'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-rose-800/60 text-xs text-rose-200 grid grid-cols-1 md:grid-cols-3 gap-3 pb-1">
            <div className="bg-rose-950/60 p-2.5 rounded border border-rose-800/40">
              <div className="flex items-center gap-1.5 font-semibold text-rose-100 mb-1">
                <HeartPulse className="w-4 h-4 text-rose-400" />
                <span>Cardiovascular & Chest Pain</span>
              </div>
              <p className="leading-relaxed">
                Sudden crushing chest pain, pain radiating to left arm or jaw, severe shortness of breath, sudden dizziness.
              </p>
            </div>

            <div className="bg-rose-950/60 p-2.5 rounded border border-rose-800/40">
              <div className="flex items-center gap-1.5 font-semibold text-rose-100 mb-1">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Neurological & Stroke (FAST)</span>
              </div>
              <p className="leading-relaxed">
                Sudden facial drooping, arm weakness or numbness, slurred speech, sudden loss of balance or vision.
              </p>
            </div>

            <div className="bg-rose-950/60 p-2.5 rounded border border-rose-800/40">
              <div className="flex items-center gap-1.5 font-semibold text-rose-100 mb-1">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Severe Trauma & Anaphylaxis</span>
              </div>
              <p className="leading-relaxed">
                Severe allergic reactions with throat swelling, uncontrolled bleeding, severe burns, or sudden loss of consciousness.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
