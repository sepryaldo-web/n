import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Shield,
  User as UserIcon,
  LogOut,
  LogIn,
  Clock,
  Laptop2,
} from 'lucide-react';
import { LoginModal } from './LoginModal';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    logout,
    switchRole,
    soundEnabled,
    setSoundEnabled,
    currentTime,
    activeTab,
    setDailyResetModalOpen,
  } = useApp();

  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);

  const formatClock = (date: Date) => {
    return date.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'dashboard': return 'Dashboard Utama';
      case 'billing': return 'Live Monitor Billing PC';
      case 'komputer': return 'Manajemen Data Komputer';
      case 'pelanggan': return 'Data Pelanggan & Member';
      case 'paket': return 'Paket Internet & Gaming';
      case 'transaksi': return 'Riwayat Transaksi Kasir';
      case 'laporan': return 'Laporan Omset & Statistik';
      case 'pengguna': return 'Manajemen Akun Pengguna';
      default: return 'Sistem Billing';
    }
  };

  return (
    <>
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-30 sticky top-0">
        {/* Left: Brand / Breadcrumbs */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-400 hidden sm:inline">Navigasi /</span>
            <span className="text-sm font-bold text-white tracking-wide">{getTabLabel(activeTab)}</span>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-cyan-500/30 bg-cyan-500/10 text-cyan-200">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-cyan-300">Welcome</span>
            <span className="text-xs font-semibold text-white">
              {currentUser ? currentUser.nama_lengkap : 'Guest'}
            </span>
          </div>
        </div>

        {/* Right: Actions, Live Clock, Sound, User Badge */}
        <div className="flex items-center gap-3">
          {/* Live Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-slate-950/80 border border-slate-800 rounded-md text-xs font-mono text-cyan-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>{formatClock(currentTime)}</span>
          </div>

          {/* Tombol Riset Harian / Tutup Shift */}
          <button
            type="button"
            onClick={() => setDailyResetModalOpen(true)}
            title="Tutup Buku & Riset Harian Kasir"
            className="px-2.5 py-1.5 bg-amber-950/50 hover:bg-amber-900/60 text-amber-300 border border-amber-800/60 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Riset Harian</span>
          </button>

          {/* Sound Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? 'Matikan Suara FX Kasir' : 'Nyalakan Suara FX Kasir'}
            className={`p-2 rounded-md border text-xs transition-colors ${
              soundEnabled
                ? 'bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700'
                : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Current User & Role */}
          {currentUser ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-white leading-tight">{currentUser.nama_lengkap}</p>
                <div className="flex items-center justify-end gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-400 font-mono">@{currentUser.username}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                      currentUser.role === 'admin'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}
                  >
                    {currentUser.role}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Keluar / Logout"
                className="p-2 bg-slate-800 hover:bg-red-950/50 hover:text-red-400 text-slate-400 rounded-md border border-slate-700 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          )}
        </div>
      </header>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
};
