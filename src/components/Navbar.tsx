import React from 'react';
import { Building2, Shield, UserCheck, LogOut, FileText, SearchCheck, LayoutDashboard } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavbarProps {
  currentTab: 'form' | 'status' | 'admin';
  onSelectTab: (tab: 'form' | 'status' | 'admin') => void;
  adminUser: User | null;
  isAdminAuthorized: boolean;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  adminUser,
  isAdminAuthorized,
  onLogout,
}) => {
  return (
    <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Identity */}
          <div
            onClick={() => onSelectTab('form')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm ring-2 ring-emerald-500/20 group-hover:bg-emerald-500 transition-colors">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  SPAK
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 hidden sm:inline-block">
                  Komuniti Kediaman
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sistem Pengurusan Aduan Kondominium Seri Mutiara
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => onSelectTab('form')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'form'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Borang Aduan</span>
            </button>

            <button
              onClick={() => onSelectTab('status')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'status'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <SearchCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Semak Status</span>
              <span className="sm:hidden">Status</span>
            </button>

            <button
              onClick={() => onSelectTab('admin')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                currentTab === 'admin'
                  ? 'bg-slate-800 text-white ring-1 ring-slate-700 shadow-sm'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Papan Pemuka Pentadbir</span>
              <span className="sm:hidden">Pentadbir</span>
              {isAdminAuthorized && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5"></span>
              )}
            </button>
          </nav>

          {/* Admin User Status & Logout */}
          <div className="flex items-center gap-3">
            {adminUser && isAdminAuthorized ? (
              <div className="flex items-center gap-2 sm:gap-3 bg-slate-800/80 border border-slate-700/80 rounded-lg p-1.5 pr-3">
                {adminUser.photoURL ? (
                  <img
                    src={adminUser.photoURL}
                    alt={adminUser.displayName || 'Pentadbir'}
                    className="w-7 h-7 rounded-full border border-slate-600 object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-800 text-emerald-200 flex items-center justify-center font-bold text-xs">
                    {(adminUser.displayName || adminUser.email || 'A')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-semibold text-slate-200 truncate max-w-[140px]">
                    {adminUser.displayName || adminUser.email?.split('@')[0]}
                  </p>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <UserCheck className="w-2.5 h-2.5" /> Pentadbir Sah
                  </span>
                </div>
                <button
                  onClick={onLogout}
                  title="Log Keluar"
                  className="p-1 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded transition-colors ml-1"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/40 px-2.5 py-1.5 rounded-lg border border-slate-800">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Portal Rasmi JMB/MC</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
