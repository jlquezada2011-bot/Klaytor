import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Building,
  Calendar,
  FileCheck,
  CheckCircle,
  XCircle,
  Search,
  Plus,
  Lock,
  RefreshCw,
  Clock,
  Filter,
} from 'lucide-react';
import { api } from '../services/api.js';
import type { SystemStats, AuditLog, Clinic } from '../types/index.js';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [logActionSearch, setLogActionSearch] = useState('');
  const [logStatusFilter, setLogStatusFilter] = useState('');

  // Add Clinic Modal State
  const [showAddClinic, setShowAddClinic] = useState(false);
  const [newClinicName, setNewClinicName] = useState('');
  const [newClinicAddress, setNewClinicAddress] = useState('');
  const [newClinicPhone, setNewClinicPhone] = useState('');
  const [newClinicEmail, setNewClinicEmail] = useState('');
  const [clinicSuccess, setClinicSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [st, uList, cList, logs] = await Promise.all([
        api.getAdminStats(),
        api.getAdminUsers(userRoleFilter !== 'ALL' ? userRoleFilter : undefined),
        api.getClinics(),
        api.getAuditLogs({ search: logActionSearch, status: logStatusFilter }),
      ]);
      setStats(st);
      setUsers(uList);
      setClinics(cList);
      setAuditLogs(logs);
    } catch (err: any) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userRoleFilter, logStatusFilter]);

  const handleToggleStatus = async (userId: string) => {
    try {
      await api.toggleUserStatus(userId);
      loadData();
    } catch (err: any) {
      alert(`Error toggling user: ${err.message}`);
    }
  };

  const handleCreateClinic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClinic({
        name: newClinicName,
        address: newClinicAddress,
        phone: newClinicPhone,
        email: newClinicEmail,
      });
      setClinicSuccess('Clinic successfully registered.');
      setNewClinicName('');
      setNewClinicAddress('');
      setNewClinicPhone('');
      setNewClinicEmail('');
      setShowAddClinic(false);
      loadData();
      setTimeout(() => setClinicSuccess(null), 4000);
    } catch (err: any) {
      alert(`Failed to add clinic: ${err.message}`);
    }
  };

  const handleSearchLogs = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  return (
    <div className="space-y-6">
      {/* Admin Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-950 border border-amber-800 text-amber-300 text-xs font-semibold rounded-full mb-2">
              <Lock className="w-3.5 h-3.5" />
              <span>Platform Governance & Administration</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              System Administration & Security
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Monitor security events, manage verified healthcare centers, review user accounts, and ensure HIPAA/data privacy compliance.
            </p>
          </div>

          <button
            onClick={loadData}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 transition-colors border border-slate-700 cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {clinicSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{clinicSuccess}</span>
        </div>
      )}

      {/* System Stats Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">Patients</span>
          <span className="text-2xl font-bold text-slate-900 block mt-1">{stats?.totalPatients ?? 0}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">Providers</span>
          <span className="text-2xl font-bold text-teal-700 block mt-1">{stats?.totalProviders ?? 0}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">Clinics</span>
          <span className="text-2xl font-bold text-slate-900 block mt-1">{stats?.totalClinics ?? 0}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">Appointments</span>
          <span className="text-2xl font-bold text-slate-900 block mt-1">{stats?.totalAppointments ?? 0}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">Pending Visits</span>
          <span className="text-2xl font-bold text-amber-600 block mt-1">{stats?.pendingAppointments ?? 0}</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 block uppercase">Audit Events</span>
          <span className="text-2xl font-bold text-indigo-600 block mt-1">{stats?.auditLogsCount ?? 0}</span>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">User Accounts & Role Governance</h3>
            <p className="text-xs text-slate-500">Manage account activation and role authorizations</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Filter:</span>
            <select
              value={userRoleFilter}
              onChange={(e) => setUserRoleFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-1 focus:ring-teal-500"
            >
              <option value="ALL">All Roles</option>
              <option value="PATIENT">Patients</option>
              <option value="PROVIDER">Providers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">User / Identity</th>
                <th className="p-3">Role</th>
                <th className="p-3">Associated Profile</th>
                <th className="p-3">Account Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3">
                    <span className="font-semibold text-slate-900 block">{u.email}</span>
                    <span className="text-[10px] text-slate-400 font-mono">ID: {u.id}</span>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : u.role === 'PROVIDER'
                          ? 'bg-teal-100 text-teal-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="p-3 text-slate-600">
                    {u.profileDetails || 'Standard Account'}
                  </td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                        u.isActive
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {u.isActive ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                      <span>{u.isActive ? 'Active' : 'Deactivated'}</span>
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => handleToggleStatus(u.id)}
                      className={`px-2.5 py-1 rounded text-xs font-semibold cursor-pointer ${
                        u.isActive
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      }`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clinic Directory Management */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Clinic & Healthcare Centers Directory</h3>
            <p className="text-xs text-slate-500">Registered locations and clinics</p>
          </div>

          <button
            onClick={() => setShowAddClinic(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Clinic</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {clinics.map((c) => (
            <div key={c.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <div className="flex items-start justify-between gap-2">
                <span className="font-bold text-slate-900 text-sm">{c.name}</span>
                <Building className="w-4 h-4 text-teal-600 shrink-0" />
              </div>
              <p className="text-slate-600 mt-1.5">{c.address}</p>
              <div className="mt-3 text-[11px] text-slate-500 space-y-0.5">
                <p>Phone: {c.phone}</p>
                <p>Email: {c.email}</p>
                <p className="text-teal-700 font-medium">Hours: {c.operatingHours}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Security Audit Log Stream */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg text-indigo-700">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Security Audit Logs</h3>
              <p className="text-xs text-slate-500">Immutable trace of authentication and data access events</p>
            </div>
          </div>

          <form onSubmit={handleSearchLogs} className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search audit logs..."
                value={logActionSearch}
                onChange={(e) => setLogActionSearch(e.target.value)}
                className="pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <button
              type="submit"
              className="px-2.5 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 sticky top-0">
              <tr>
                <th className="p-2.5">Timestamp</th>
                <th className="p-2.5">Action Event</th>
                <th className="p-2.5">User / Actor</th>
                <th className="p-2.5">Target Resource</th>
                <th className="p-2.5">Status</th>
                <th className="p-2.5">Event Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="p-2.5 text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="p-2.5 font-bold text-slate-800">{log.action}</td>
                  <td className="p-2.5 text-slate-600">{log.userEmail || 'system'}</td>
                  <td className="p-2.5 text-slate-500">{log.resource}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        log.status === 'SUCCESS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : log.status === 'BLOCKED'
                          ? 'bg-rose-100 text-rose-800 font-bold animate-pulse'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                  <td className="p-2.5 text-slate-600 font-sans text-xs">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Clinic Modal */}
      {showAddClinic && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Register New Healthcare Clinic</h3>
            <p className="text-xs text-slate-500 mb-4">Add a new clinic location to the Klaytor directory.</p>

            <form onSubmit={handleCreateClinic} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinic Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Klaytor North General Clinic"
                  value={newClinicName}
                  onChange={(e) => setNewClinicName(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Address</label>
                <input
                  type="text"
                  required
                  placeholder="Street, City, Postal Code"
                  value={newClinicAddress}
                  onChange={(e) => setNewClinicAddress(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={newClinicPhone}
                    onChange={(e) => setNewClinicPhone(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="clinic@example.com"
                    value={newClinicEmail}
                    onChange={(e) => setNewClinicEmail(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddClinic(false)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 cursor-pointer"
                >
                  Register Clinic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
