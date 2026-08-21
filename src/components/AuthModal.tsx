import React, { useState } from 'react';
import { Lock, Mail, User, AlertCircle, X, Shield, Activity, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register, switchDemoRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('1994-06-15');
  const [gender, setGender] = useState('Female');
  const [bloodType, setBloodType] = useState('A+');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          email,
          password,
          role: 'PATIENT',
          firstName,
          lastName,
          dateOfBirth,
          gender,
          bloodType,
        });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: 'PATIENT' | 'PROVIDER' | 'ADMIN') => {
    setError(null);
    setSubmitting(true);
    try {
      await switchDemoRole(role);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center mx-auto mb-3 shadow-xs">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            {mode === 'login' ? 'Sign in to Klaytor' : 'Create Patient Account'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {mode === 'login'
              ? 'Access your secure electronic health records and appointments'
              : 'Join the Klaytor digital health platform'}
          </p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  >
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Email Address</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer mt-2 disabled:opacity-50"
          >
            {submitting ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="mt-4 text-center text-xs text-slate-600">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                onClick={() => setMode('register')}
                className="text-teal-600 font-bold hover:underline cursor-pointer"
              >
                Register as Patient
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                onClick={() => setMode('login')}
                className="text-teal-600 font-bold hover:underline cursor-pointer"
              >
                Sign in here
              </button>
            </span>
          )}
        </div>

        {/* Fast Demo Account Buttons */}
        <div className="mt-6 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block text-center mb-2.5">
            Or Test with Instant Demo Logins
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => handleDemoLogin('PATIENT')}
              className="p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl text-center cursor-pointer transition-colors"
            >
              <span className="text-xs font-bold text-teal-900 block">Patient</span>
              <span className="text-[10px] text-slate-500 block">Jane Doe</span>
            </button>

            <button
              onClick={() => handleDemoLogin('PROVIDER')}
              className="p-2 bg-slate-50 hover:bg-teal-50 border border-slate-200 rounded-xl text-center cursor-pointer transition-colors"
            >
              <span className="text-xs font-bold text-teal-900 block">Doctor</span>
              <span className="text-[10px] text-slate-500 block">Dr. Vance</span>
            </button>

            <button
              onClick={() => handleDemoLogin('ADMIN')}
              className="p-2 bg-slate-50 hover:bg-amber-50 border border-slate-200 rounded-xl text-center cursor-pointer transition-colors"
            >
              <span className="text-xs font-bold text-amber-900 block">Admin</span>
              <span className="text-[10px] text-slate-500 block">Sarah J.</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
