import React from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import {
  LayoutDashboard,
  Timer,
  Monitor,
  Users,
  Package,
  ReceiptText,
  BarChart3,
  UserCog,
  RotateCcw,
  Zap,
} from 'lucide-react';

export const Sidebar: React.FC<{ mobileOpen?: boolean; onCloseMobile?: () => void }> = ({
  mobileOpen = false,
  onCloseMobile,
}) => {
  const { activeTab, setActiveTab, currentUser, billing, setDailyResetModalOpen } = useApp();

  const activeBillingCount = billing.filter(b => b.status_billing === 'aktif').length;
  const isAdmin = currentUser?.role === 'admin';

  interface NavItem {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    adminOnly?: boolean;
    badge?: number;
  }

  // Hanya menu operasional warnet (Menu ERD/PostgreSQL & Source PHP/XAMPP telah dihapus sesuai permintaan)
  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'billing',
      label: 'Billing PC',
      icon: <Timer className="w-4 h-4" />,
      badge: activeBillingCount,
    },
    {
      id: 'komputer',
      label: 'Komputer',
      icon: <Monitor className="w-4 h-4" />,
    },
    {
      id: 'pelanggan',
      label: 'Pelanggan',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'paket',
      label: 'Paket Warnet',
      icon: <Package className="w-4 h-4" />,
    },
    {
      id: 'transaksi',
      label: 'Transaksi',
      icon: <ReceiptText className="w-4 h-4" />,
    },
    {
      id: 'laporan',
      label: 'Laporan',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'pengguna',
      label: 'Pengguna',
      icon: <UserCog className="w-4 h-4" />,
      adminOnly: true,
    },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside
      className={`w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 select-none transition-all duration-200 ${
        mobileOpen
          ? 'fixed inset-y-0 left-0 z-50 shadow-2xl'
          : 'hidden md:flex'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 border-b border-slate-800 flex items-center gap-3 px-5">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30">
          <Zap className="w-5 h-5 fill-current" />
        </div>
        <div>
          <h1 className="font-extrabold text-sm text-white tracking-wide leading-none">
            NETBILLING
          </h1>
          <p className="text-[11px] text-slate-400 mt-1">Warnet & Esports Center</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Menu Operasional
        </div>

        {navItems.map(item => {
          if (item.adminOnly && !isAdmin) return null;

          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className={isActive ? 'text-white' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>

              {typeof item.badge === 'number' && item.badge > 0 && (
                <span
                  className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-amber-500/20 text-amber-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Tombol Riset Harian / Tutup Buku Kasir */}
        <div className="pt-4 mt-3 border-t border-slate-800 px-1">
          <button
            type="button"
            onClick={() => {
              setDailyResetModalOpen(true);
              if (onCloseMobile) onCloseMobile();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-amber-300 bg-amber-950/30 hover:bg-amber-950/60 border border-amber-900/40 transition-colors"
          >
            <RotateCcw className="w-4 h-4 text-amber-400" />
            <span>Riset Harian & Tutup Shift</span>
          </button>
        </div>
      </nav>

      {/* Bottom Footer Info */}
      <div className="p-3 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span>Role Pengguna:</span>
          <span className="font-bold text-white capitalize">{currentUser?.role || 'Guest'}</span>
        </div>
        <p className="text-[10px] text-slate-500 mt-1">Sistem Billing Warnet v1.2</p>
      </div>
    </aside>
  );
};
