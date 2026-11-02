import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lock, User, AlertCircle, KeyRound, Eye, EyeOff, X } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { login, users } = useApp();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  if (!isOpen) return null;

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
      if (onClose) onClose();
    } else {
      setError('Username atau password yang Anda masukkan salah!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-600/20 text-blue-400 rounded-xl flex items-center justify-center mx-auto mb-3 ring-4 ring-blue-600/10">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">Login Sistem Billing Warnet</h2>
          <p className="text-xs text-slate-400 mt-1">
            Masuk menggunakan username dan password yang terdaftar di Menu Pengguna
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-950/40 border border-red-900/60 rounded-lg flex items-start gap-2 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Username
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username akun Anda"
                required
                autoFocus
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Password
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password akun Anda"
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-sm text-white font-mono focus:outline-hidden focus:border-blue-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 transition-colors"
                title={showPassword ? 'Sembunyikan password' : 'Lihat password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition-colors cursor-pointer"
          >
            Masuk ke Aplikasi
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500">
            Username dan password dikelola oleh Administrator di <strong>Menu Pengguna</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
