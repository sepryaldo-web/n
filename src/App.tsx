import React, { useEffect, useState } from 'react';
import { useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { BillingView } from './components/BillingView';
import { KomputerView } from './components/KomputerView';
import { PelangganView } from './components/PelangganView';
import { PaketView } from './components/PaketView';
import { TransaksiView } from './components/TransaksiView';
import { LaporanView } from './components/LaporanView';
import { PenggunaView } from './components/PenggunaView';

import { StartBillingModal } from './components/StartBillingModal';
import { PaymentModal } from './components/PaymentModal';
import { ReceiptModal } from './components/ReceiptModal';
import { DailyResetModal } from './components/DailyResetModal';
import { LoginModal } from './components/LoginModal';
import { Menu, X, ShieldAlert } from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const isAdmin = currentUser?.role === 'admin';

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'billing':
        return <BillingView />;
      case 'komputer':
        return <KomputerView />;
      case 'pelanggan':
        return <PelangganView />;
      case 'paket':
        return <PaketView />;
      case 'transaksi':
        return <TransaksiView />;
      case 'laporan':
        return <LaporanView />;
      case 'pengguna':
        if (!isAdmin) {
          return (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-xl space-y-3">
              <ShieldAlert className="w-12 h-12 text-amber-400 mx-auto" />
              <h3 className="text-base font-bold text-white">Akses Terbatas untuk Administrator</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Akun Anda saat ini memiliki peran <b>Operator</b>. Halaman manajemen pengguna hanya dapat diakses oleh akun dengan hak akses <b>Admin</b>.
              </p>
            </div>
          );
        }
        return <PenggunaView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-blue-600 selection:text-white">
      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <div className="flex flex-1 min-h-screen">
        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Content Wrapper */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Navbar */}
          <div className="flex items-center">
            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-3 text-slate-400 hover:text-white md:hidden bg-slate-900 border-b border-slate-800"
              title="Menu Navigasi"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex-1">
              <Navbar />
            </div>
          </div>

          {/* Main View Area */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {renderActiveView()}
          </main>
        </div>
      </div>

      {/* Global Interactive Modals */}
      <StartBillingModal />
      <PaymentModal />
      <ReceiptModal />
      <DailyResetModal />
    </div>
  );
};

// Full-screen login page shown when no user is logged in
const LoginPage: React.FC = () => {
  const { login, currentUser, users, setActiveTab } = useApp();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setError('Harap isi username dan password!');
      return;
    }

    const foundUser = users.find(u => u.username.toLowerCase() === cleanUser);
    if (!foundUser) {
      setError('Username atau password yang Anda masukkan salah!');
      return;
    }

    if (foundUser.status === 'nonaktif') {
      setError('Username atau password yang Anda masukkan salah!');
      return;
    }

    const userPass = foundUser.password || (foundUser.username === 'admin' ? 'admin123' : 'operator123');
    if (userPass !== cleanPass) {
      setError('Username atau password yang Anda masukkan salah!');
      return;
    }

    const ok = login(cleanUser, cleanPass);
    if (ok) {
      setUsername('');
      setPassword('');
      setError('');
      setActiveTab('dashboard');
    } else {
      setError('Username atau password yang Anda masukkan salah!');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-8 text-slate-100 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-4 ring-4 ring-blue-600/10">
            <span className="text-4xl">🔐</span>
          </div>
          <h2 className="text-2xl font-bold text-white">Login Sistem Billing Warnet</h2>
          <p className="text-xs text-slate-400 mt-1">Masuk menggunakan username dan password</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded-lg flex items-start gap-2 text-xs text-red-300">
            <span className="text-red-300">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Username</label>
            <div className="relative">
              <span className="w-4 h-4 absolute left-3 top-2.5 text-slate-500">👤</span>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username akun Anda"
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-3 py-3 text-sm text-white font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
            <div className="relative">
              <span className="w-4 h-4 absolute left-3 top-2.5 text-slate-500">🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password akun Anda"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-10 py-3 text-sm text-white font-mono focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <span className="text-slate-500">🙈</span> : <span className="text-slate-500">👁</span>}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-colors cursor-pointer"
          >
            Masuk ke Aplikasi
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Username dan password dikelola oleh Administrator di <strong>Menu Pengguna</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { currentUser, setActiveTab } = useApp();

  // Otomatis beralih ke dashboard saat user login
  useEffect(() => {
    if (currentUser) {
      setActiveTab('dashboard');
    }
  }, [currentUser]);

  // Show login page first when no user is logged in
  if (!currentUser) {
    return <LoginPage />;
  }

  // Show main layout when user is logged in
  return <MainLayout />;
}