import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, UserRole } from '../types';
import {
  UserCog,
  Plus,
  Edit2,
  Trash2,
  X,
  AlertTriangle,
  AlertCircle,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  User as UserIcon,
} from 'lucide-react';

export const PenggunaView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useApp();

  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Modal Confirm Delete State (Berfungsi tanpa window.confirm)
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteErrorMsg, setDeleteErrorMsg] = useState<string>('');

  // Form State
  const [formUsername, setFormUsername] = useState<string>('');
  const [formNama, setFormNama] = useState<string>('');
  const [formRole, setFormRole] = useState<UserRole>('operator');
  const [formStatus, setFormStatus] = useState<'aktif' | 'nonaktif'>('aktif');
  const [formPassword, setFormPassword] = useState<string>('');
  const [showModalPassword, setShowModalPassword] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Toggle reveal password per baris di tabel
  const [revealedPasswords, setRevealedPasswords] = useState<Record<number, boolean>>({});

  const toggleRevealPassword = (userId: number) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [userId]: !prev[userId],
    }));
  };

  const handleOpenAdd = () => {
    setEditingUser(null);
    setFormUsername('');
    setFormNama('');
    setFormRole('operator');
    setFormStatus('aktif');
    setFormPassword('');
    setShowModalPassword(true);
    setFormError('');
    setModalOpen(true);
  };

  const handleOpenEdit = (u: User) => {
    setEditingUser(u);
    setFormUsername(u.username);
    setFormNama(u.nama_lengkap);
    setFormRole(u.role);
    setFormStatus(u.status);
    setFormPassword(u.password || '');
    setShowModalPassword(false);
    setFormError('');
    setModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!userToDelete) return;
    setDeleteErrorMsg('');
    const res = deleteUser(userToDelete.id_user);
    if (res.success) {
      setUserToDelete(null);
    } else {
      setDeleteErrorMsg(res.message);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formUsername.trim() || !formNama.trim()) {
      setFormError('Username dan nama lengkap wajib diisi!');
      return;
    }

    if (!editingUser && !formPassword.trim()) {
      setFormError('Password login wajib diisi untuk akun baru!');
      return;
    }

    if (formPassword.trim() && formPassword.trim().length < 4) {
      setFormError('Password minimal harus 4 karakter!');
      return;
    }

    const cleanUsername = formUsername.trim().toLowerCase().replace(/\s+/g, '');
    const duplicate = users.find(
      u =>
        u.username.toLowerCase() === cleanUsername &&
        (!editingUser || editingUser.id_user !== u.id_user)
    );
    if (duplicate) {
      setFormError(`Username "${cleanUsername}" sudah digunakan oleh pengguna lain!`);
      return;
    }

    if (editingUser) {
      updateUser(editingUser.id_user, {
        username: cleanUsername,
        nama_lengkap: formNama.trim(),
        role: formRole,
        status: formStatus,
        ...(formPassword.trim() ? { password: formPassword.trim() } : {}),
      });
    } else {
      addUser({
        username: cleanUsername,
        nama_lengkap: formNama.trim(),
        role: formRole,
        status: formStatus,
        password: formPassword.trim(),
      });
    }

    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserCog className="w-5 h-5 text-amber-400" />
            <span>Manajemen Akun Pengguna (Admin & Operator)</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Buat username dan password pengguna, kelola hak akses kasir, dan atur akun yang dapat login.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-blue-600/20 flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Akun Pengguna</span>
        </button>
      </div>

      {/* Info Card */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-start gap-3">
        <Lock className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <p className="font-semibold text-white">Sistem Login Sesuai Akun Pengguna</p>
          <p className="text-slate-400">
            Setiap pengguna harus login dengan memasukkan <strong>Username</strong> dan <strong>Password</strong> yang dibuat di menu ini. Login 1-klik telah dihapus demi keamanan operasional kasir.
          </p>
        </div>
      </div>

      {/* Table Users */}
      <div className="overflow-x-auto bg-slate-900 border border-slate-800 rounded-xl">
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-950/70 border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Username Login</th>
              <th className="px-4 py-3">Nama Lengkap</th>
              <th className="px-4 py-3">Role / Hak Akses</th>
              <th className="px-4 py-3">Password</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {users.map(u => {
              const isSelf = currentUser && currentUser.id_user === u.id_user;
              const isPasswordRevealed = !!revealedPasswords[u.id_user];
              const displayPass = u.password || (u.username === 'admin' ? 'admin123' : 'operator123');

              return (
                <tr key={u.id_user} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500">{u.id_user}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono font-bold text-white">
                      <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{u.username}</span>
                      {isSelf && (
                        <span className="text-[10px] text-blue-400 font-sans font-normal ml-1">
                          (Sedang Login)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-200">{u.nama_lengkap}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        u.role === 'admin'
                          ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 font-mono text-[11px]">
                      <KeyRound className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className={isPasswordRevealed ? 'text-amber-300 font-bold' : 'text-slate-500'}>
                        {isPasswordRevealed ? displayPass : '••••••••'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleRevealPassword(u.id_user)}
                        className="p-1 text-slate-500 hover:text-slate-300 rounded transition-colors cursor-pointer"
                        title={isPasswordRevealed ? 'Sembunyikan password' : 'Lihat password'}
                      >
                        {isPasswordRevealed ? (
                          <EyeOff className="w-3 h-3 text-amber-400" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        u.status === 'aktif'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(u)}
                        title="Edit Akun & Password"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-md transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!isSelf && (
                        <button
                          type="button"
                          onClick={() => {
                            setDeleteErrorMsg('');
                            setUserToDelete(u);
                          }}
                          title="Hapus Akun"
                          className="p-1.5 bg-slate-800 hover:bg-red-950/60 hover:text-red-400 text-slate-400 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal Konfirmasi Hapus Akun User */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-sm w-full p-5 text-slate-100 shadow-2xl relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">Konfirmasi Hapus Akun</h3>
                <p className="text-xs text-slate-400">Akun pengguna akan dihapus</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 my-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
              Apakah Anda yakin ingin menghapus akun <strong className="text-white font-mono">{userToDelete.username}</strong> ({userToDelete.nama_lengkap})?
            </p>

            {deleteErrorMsg && (
              <div className="mb-3 p-2 bg-red-950/50 border border-red-800/60 rounded text-[11px] text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{deleteErrorMsg}</span>
              </div>
            )}

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="flex-1 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold shadow-md shadow-red-600/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form Tambah / Edit User & Password */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 text-slate-100 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                  <UserCog className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingUser ? `Edit Akun & Password: ${editingUser.username}` : 'Buat Akun Pengguna Baru'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Atur username login, password, dan hak akses</p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="my-3 p-2.5 bg-red-950/40 border border-red-900/60 rounded-lg text-xs text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
              {/* Username Input */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Username Login <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type="text"
                    value={formUsername}
                    onChange={e => setFormUsername(e.target.value)}
                    placeholder="Contoh: kasir1 / admin2"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Digunakan untuk masuk / login ke aplikasi (huruf kecil tanpa spasi).
                </span>
              </div>

              {/* Password Input dengan Show/Hide */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-slate-400 font-semibold">
                    Password Login <span className="text-red-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowModalPassword(!showModalPassword)}
                    className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-1"
                  >
                    {showModalPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showModalPassword ? 'Sembunyikan' : 'Lihat'}</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                  <input
                    type={showModalPassword ? 'text' : 'password'}
                    value={formPassword}
                    onChange={e => setFormPassword(e.target.value)}
                    placeholder={editingUser ? 'Ketik password baru jika ingin mengubah' : 'Minimal 4 karakter, contoh: kasir123'}
                    required={!editingUser}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-10 py-2 text-white font-mono focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Password yang akan diketik saat pengguna melakukan login di aplikasi.
                </span>
              </div>

              {/* Nama Lengkap */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Nama Lengkap <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={e => setFormNama(e.target.value)}
                  placeholder="Contoh: Rian Pratama (Kasir Siang)"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              {/* Role & Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Role / Hak Akses</label>
                  <select
                    value={formRole}
                    onChange={e => setFormRole(e.target.value as UserRole)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="operator">Operator (Kasir)</option>
                    <option value="admin">Administrator (Penuh)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Status Akun</label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as 'aktif' | 'nonaktif')}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-hidden focus:border-blue-500"
                  >
                    <option value="aktif">Aktif</option>
                    <option value="nonaktif">Nonaktif</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-md shadow-blue-600/20 cursor-pointer"
                >
                  {editingUser ? 'Simpan Akun & Password' : 'Buat Akun & Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
