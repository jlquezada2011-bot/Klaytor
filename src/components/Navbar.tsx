import React, { useState, useEffect } from 'react';
import {
  Activity,
  Calendar,
  FileText,
  Heart,
  BookOpen,
  MessageSquare,
  Shield,
  Search,
  Bot,
  Bell,
  LogOut,
  User as UserIcon,
  Globe,
  Settings,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage, type Language } from '../context/LanguageContext.js';
import { api } from '../services/api.js';
import type { Notification } from '../types/index.js';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openSearch: () => void;
  openAiAssistant: () => void;
  openAuthModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openSearch,
  openAiAssistant,
  openAuthModal,
}) => {
  const { user, profile, logout, switchDemoRole } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.getNotifications();
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      fetchNotifications();
    } catch {
      // ignore
    }
  };

  const getDisplayName = () => {
    if (!profile) return user?.email || 'User';
    if ('firstName' in profile && 'lastName' in profile) {
      if (user?.role === 'PROVIDER') return `Dr. ${profile.firstName} ${profile.lastName}`;
      return `${profile.firstName} ${profile.lastName}`;
    }
    return user?.email || 'User';
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              id="brand-logo-btn"
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm group-hover:bg-teal-700 transition-colors">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-slate-900 block leading-tight">
                  Klaytor
                </span>
                <span className="text-[11px] font-medium tracking-wider uppercase text-teal-600 block">
                  Health Platform
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                id="nav-tab-dashboard"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>{t('dashboard')}</span>
              </button>

              <button
                onClick={() => setActiveTab('appointments')}
                id="nav-tab-appointments"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'appointments'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>{t('appointments')}</span>
              </button>

              <button
                onClick={() => setActiveTab('records')}
                id="nav-tab-records"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'records'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>{t('healthRecords')}</span>
              </button>

              <button
                onClick={() => setActiveTab('monitoring')}
                id="nav-tab-monitoring"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'monitoring'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Heart className="w-4 h-4" />
                <span>{t('healthMonitoring')}</span>
              </button>

              <button
                onClick={() => setActiveTab('education')}
                id="nav-tab-education"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'education'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>{t('healthEducation')}</span>
              </button>

              <button
                onClick={() => setActiveTab('messages')}
                id="nav-tab-messages"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'messages'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span>{t('messages')}</span>
              </button>

              <button
                onClick={() => setActiveTab('privacy')}
                id="nav-tab-privacy"
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'privacy'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span>{t('privacyConsent')}</span>
              </button>

              {user?.role === 'ADMIN' && (
                <button
                  onClick={() => setActiveTab('admin')}
                  id="nav-tab-admin"
                  className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeTab === 'admin'
                      ? 'bg-amber-50 text-amber-800'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Settings className="w-4 h-4 text-amber-600" />
                  <span>{t('adminCenter')}</span>
                </button>
              )}
            </nav>
          </div>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-2">
            {/* Fast Demo Role Switcher */}
            <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <span className="text-[11px] font-semibold text-slate-500 px-2">Demo:</span>
              <button
                onClick={() => switchDemoRole('PATIENT')}
                id="switch-demo-patient"
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  user?.role === 'PATIENT'
                    ? 'bg-white text-teal-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Patient
              </button>
              <button
                onClick={() => switchDemoRole('PROVIDER')}
                id="switch-demo-doctor"
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  user?.role === 'PROVIDER'
                    ? 'bg-white text-teal-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Doctor
              </button>
              <button
                onClick={() => switchDemoRole('ADMIN')}
                id="switch-demo-admin"
                className={`px-2 py-1 rounded font-medium transition-colors cursor-pointer ${
                  user?.role === 'ADMIN'
                    ? 'bg-white text-teal-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin
              </button>
            </div>

            {/* Universal Search Button */}
            <button
              onClick={openSearch}
              id="header-search-btn"
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Search Klaytor Platform"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* AI Assistant Button */}
            <button
              onClick={openAiAssistant}
              id="header-ai-guide-btn"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-teal-50 border border-teal-200 text-teal-700 hover:bg-teal-100 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              title="Ask Klaytor AI Health Guide"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              <span className="hidden sm:inline">AI Guide</span>
            </button>

            {/* Multi-language Selector */}
            <div className="relative group">
              <button
                id="language-selector-btn"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                title="Change Language"
                aria-label="Language selector"
              >
                <Globe className="w-4 h-4" />
                <span className="text-xs uppercase font-semibold text-slate-600">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block bg-white border border-slate-200 rounded-lg shadow-lg py-1 w-32 z-50">
                <button
                  onClick={() => setLanguage('en')}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 cursor-pointer ${
                    language === 'en' ? 'font-bold text-teal-600' : 'text-slate-700'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('fil')}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 cursor-pointer ${
                    language === 'fil' ? 'font-bold text-teal-600' : 'text-slate-700'
                  }`}
                >
                  Filipino (Tagalog)
                </button>
                <button
                  onClick={() => setLanguage('ceb')}
                  className={`w-full text-left px-3 py-1.5 text-xs hover:bg-slate-50 cursor-pointer ${
                    language === 'ceb' ? 'font-bold text-teal-600' : 'text-slate-700'
                  }`}
                >
                  Bisaya (Cebuano)
                </button>
              </div>
            </div>

            {/* Notification Popover */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                id="notifications-toggle-btn"
                className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors relative cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                      {unreadCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={handleMarkAllRead}
                        className="text-[11px] text-teal-600 hover:text-teal-800 font-semibold cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-500">
                        No notifications at this time.
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleMarkAsRead(notif.id)}
                          className={`p-3 text-xs transition-colors cursor-pointer ${
                            notif.isRead ? 'bg-white hover:bg-slate-50' : 'bg-teal-50/50 hover:bg-teal-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-slate-900">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 shrink-0">
                              {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-0.5 leading-relaxed">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Menu */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  id="user-menu-btn"
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 rounded-full bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
                    {profile && 'firstName' in profile ? profile.firstName[0] : user.email[0].toUpperCase()}
                  </div>
                  <div className="hidden xl:block text-left">
                    <span className="text-xs font-semibold text-slate-900 block leading-tight">
                      {getDisplayName()}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 block uppercase">
                      {user.role}
                    </span>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl z-50 py-1">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{getDisplayName()}</p>
                      <p className="text-[11px] text-slate-500 truncate">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                        ROLE: {user.role}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('records');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Records</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('privacy');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Privacy & Consent Settings</span>
                    </button>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      id="logout-btn"
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={openAuthModal}
                id="navbar-login-btn"
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar */}
      <div className="lg:hidden border-t border-slate-200 bg-slate-50 px-2 py-1.5 flex items-center justify-around text-center overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          {t('dashboard')}
        </button>
        <button
          onClick={() => setActiveTab('appointments')}
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap cursor-pointer ${
            activeTab === 'appointments' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          {t('appointments')}
        </button>
        <button
          onClick={() => setActiveTab('records')}
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap cursor-pointer ${
            activeTab === 'records' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          {t('healthRecords')}
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap cursor-pointer ${
            activeTab === 'monitoring' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          {t('healthMonitoring')}
        </button>
        <button
          onClick={() => setActiveTab('messages')}
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap cursor-pointer ${
            activeTab === 'messages' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          {t('messages')}
        </button>
        <button
          onClick={() => setActiveTab('education')}
          className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap cursor-pointer ${
            activeTab === 'education' ? 'bg-teal-600 text-white' : 'text-slate-600'
          }`}
        >
          {t('healthEducation')}
        </button>
        {user?.role === 'ADMIN' && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap cursor-pointer ${
              activeTab === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-600'
            }`}
          >
            Admin
          </button>
        )}
      </div>
    </header>
  );
};
