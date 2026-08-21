import React, { useState, useEffect } from 'react';
import {
  Heart,
  Activity,
  Plus,
  TrendingUp,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle,
  Thermometer,
  Scale,
  Wind,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import type { HealthMeasurement } from '../types/index.js';

interface HealthMonitoringViewProps {
  openVitalsModal: () => void;
}

export const HealthMonitoringView: React.FC<HealthMonitoringViewProps> = ({ openVitalsModal }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [measurements, setMeasurements] = useState<HealthMeasurement[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('ALL');

  const loadData = async () => {
    try {
      const [mRes, sRes] = await Promise.all([
        api.getMeasurements(selectedType !== 'ALL' ? { type: selectedType } : undefined),
        api.getMeasurementStats(),
      ]);
      setMeasurements(mRes.measurements || []);
      setStats(sRes);
    } catch (err: any) {
      console.error('Error loading measurements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, selectedType]);

  // Prepare chart data chronologically
  const chartData = [...measurements]
    .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime())
    .map((m) => ({
      date: new Date(m.recordedAt).toLocaleDateString([], { month: 'short', day: 'numeric' }),
      type: m.measurementType,
      value: m.value,
      systolic: m.systolic || (m.measurementType === 'blood_pressure' ? m.value : undefined),
      diastolic: m.diastolic,
      notes: m.notes,
    }));

  const bpData = chartData.filter((d) => d.type === 'blood_pressure');
  const hrData = chartData.filter((d) => d.type === 'heart_rate');
  const weightData = chartData.filter((d) => d.type === 'weight');

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Health Monitoring & Vitals Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track resting heart rates, blood pressure trends, body temperature, and weights.
          </p>
        </div>

        <button
          onClick={openVitalsModal}
          id="record-new-vitals-btn"
          className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{t('recordVitals')}</span>
        </button>
      </div>

      {/* Safety Disclaimer Callout */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold text-amber-950">Patient Guidance: </strong>
          Health measurements recorded here are for personal lifestyle awareness and tracking. They are not intended as diagnostic medical devices. Always consult your physician regarding abnormal readings.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Heart className="w-4 h-4 text-rose-500" />
            <span>Blood Pressure</span>
          </div>
          <span className="text-lg font-bold text-slate-900 block mt-2">
            {stats?.latest?.bloodPressure || '120/80 mmHg'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Target: &lt; 120/80 mmHg</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Heart Rate</span>
          </div>
          <span className="text-lg font-bold text-slate-900 block mt-2">
            {stats?.latest?.heartRate || '72 bpm'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Resting Adult: 60-100 bpm</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Wind className="w-4 h-4 text-indigo-500" />
            <span>Oxygen (SpO2)</span>
          </div>
          <span className="text-lg font-bold text-slate-900 block mt-2">
            {stats?.latest?.spo2 || '98 %'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Normal: 95 - 100%</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold">
            <Scale className="w-4 h-4 text-amber-500" />
            <span>Body Weight</span>
          </div>
          <span className="text-lg font-bold text-slate-900 block mt-2">
            {stats?.latest?.weight || '64 kg'}
          </span>
          <span className="text-[10px] text-slate-400 block mt-0.5">Recorded log history</span>
        </div>
      </div>

      {/* Visual Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blood Pressure Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Blood Pressure History (mmHg)</h3>
              <p className="text-xs text-slate-500">Systolic (Top) vs. Diastolic (Bottom)</p>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
              Trend
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            {bpData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                No blood pressure logs available for chart display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={bpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis domain={[50, 160]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    name="Systolic (mmHg)"
                    stroke="#e11d48"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    name="Diastolic (mmHg)"
                    stroke="#0d9488"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Heart Rate / Vitals History Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Heart Rate Trend (BPM)</h3>
              <p className="text-xs text-slate-500">Resting beats per minute over time</p>
            </div>
            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
              BPM
            </span>
          </div>

          <div className="h-64 w-full text-xs">
            {hrData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-400">
                No heart rate logs available for chart display.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" />
                  <YAxis domain={[40, 140]} stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                  <Area
                    type="monotone"
                    dataKey="value"
                    name="Heart Rate (bpm)"
                    stroke="#0d9488"
                    fill="#ccfbf1"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Historical Measurements Log Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-sm font-bold text-slate-900">Recorded Measurements Log</h3>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500">Filter:</span>
            {['ALL', 'blood_pressure', 'heart_rate', 'temperature', 'weight', 'spo2'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  selectedType === type
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Measurement Type</th>
                <th className="p-3">Value / Reading</th>
                <th className="p-3">Unit</th>
                <th className="p-3">Recorded Date</th>
                <th className="p-3">Notes / Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {measurements.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="p-3 font-bold text-slate-900 capitalize">
                    {m.measurementType.replace('_', ' ')}
                  </td>
                  <td className="p-3 font-mono font-bold text-teal-700">
                    {m.measurementType === 'blood_pressure' && m.systolic
                      ? `${m.systolic}/${m.diastolic}`
                      : m.value}
                  </td>
                  <td className="p-3 text-slate-500">{m.unit}</td>
                  <td className="p-3 text-slate-600 font-mono">
                    {new Date(m.recordedAt).toLocaleString([], {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="p-3 text-slate-500">{m.notes || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
