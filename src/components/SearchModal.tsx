import React, { useState, useEffect } from 'react';
import { Search, X, User, Building, BookOpen, Calendar, FileText, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, patientId?: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    providers: any[];
    clinics: any[];
    articles: any[];
    appointments: any[];
    patientRecords: any[];
  }>({
    providers: [],
    clinics: [],
    articles: [],
    appointments: [],
    patientRecords: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ providers: [], clinics: [], articles: [], appointments: [], patientRecords: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await api.search(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResults =
    results.providers.length +
    results.clinics.length +
    results.articles.length +
    results.appointments.length +
    results.patientRecords.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-16 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Search Header Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3">
          <Search className="w-5 h-5 text-teal-600 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search providers, clinics, articles, appointments, records..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm outline-none text-slate-900 placeholder:text-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {loading && (
            <div className="py-8 text-center text-slate-400">
              Searching across secure healthcare registry...
            </div>
          )}

          {!loading && query.trim() && totalResults === 0 && (
            <div className="py-8 text-center text-slate-400">
              No results found matching "{query}".
            </div>
          )}

          {/* Providers */}
          {results.providers.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Healthcare Providers ({results.providers.length})
              </span>
              <div className="space-y-1.5">
                {results.providers.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      onNavigate('appointments');
                      onClose();
                    }}
                    className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-teal-600 text-white rounded-lg">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">
                          Dr. {p.firstName} {p.lastName}, {p.title}
                        </span>
                        <span className="text-slate-500 text-[11px]">{p.specialty}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Clinics */}
          {results.clinics.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Clinics & Centers ({results.clinics.length})
              </span>
              <div className="space-y-1.5">
                {results.clinics.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      onNavigate('appointments');
                      onClose();
                    }}
                    className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-slate-800 text-white rounded-lg">
                        <Building className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-slate-500 text-[11px]">{c.address}</span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Health Articles */}
          {results.articles.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Health Education Articles ({results.articles.length})
              </span>
              <div className="space-y-1.5">
                {results.articles.map((a) => (
                  <div
                    key={a.id}
                    onClick={() => {
                      onNavigate('education');
                      onClose();
                    }}
                    className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-indigo-600 text-white rounded-lg">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{a.title}</span>
                        <span className="text-slate-500 text-[11px]">
                          {a.category} • {a.readTime}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Appointments */}
          {results.appointments.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Matching Appointments ({results.appointments.length})
              </span>
              <div className="space-y-1.5">
                {results.appointments.map((appt) => (
                  <div
                    key={appt.id}
                    onClick={() => {
                      onNavigate('appointments');
                      onClose();
                    }}
                    className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-amber-600 text-white rounded-lg">
                        <Calendar className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{appt.reason}</span>
                        <span className="text-slate-500 text-[11px]">
                          {appt.appointmentDate} at {appt.appointmentTime} ({appt.status})
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Patient Records (RBAC Protected) */}
          {results.patientRecords.length > 0 && (
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Authorized Clinical Records ({results.patientRecords.length})
              </span>
              <div className="space-y-1.5">
                {results.patientRecords.map((r, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      onNavigate('records', r.id);
                      onClose();
                    }}
                    className="p-3 bg-slate-50 hover:bg-teal-50 rounded-xl border border-slate-100 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 bg-emerald-600 text-white rounded-lg">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="font-bold text-slate-900 block">{r.title}</span>
                        <span className="text-slate-500 text-[11px]">
                          {r.type}: {r.detail}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
