import { Paket } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

export function formatDateTime(isoOrDateStr: string): string {
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return isoOrDateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(d);
  } catch {
    return isoOrDateStr;
  }
}

export function formatDateOnly(isoOrDateStr: string): string {
  try {
    const d = new Date(isoOrDateStr);
    if (isNaN(d.getTime())) return isoOrDateStr;
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return isoOrDateStr;
  }
}

/**
 * Perhitungan Billing Otomatis:
 * 1. Jika memilih Paket Internet (misal Paket 3 Jam Rp 13.000):
 *    - Jika durasi <= durasi_paket: Biaya = harga paket
 *    - Jika melebihi durasi paket: Biaya = harga paket + prorata tarif normal per jam untuk kelebihannya (dibulatkan per 10 menit atau pecahan)
 * 2. Jika tarif per jam normal:
 *    - Dihitung berdasarkan durasi menit: (menit / 60) * tarif_per_jam.
 *    - Minimum pemakaian: 15 menit.
 *    - Dibulatkan ke kelipatan 500 terdekat agar ramah uang receh kasir.
 */
export function calculateBillingCost(
  seconds: number,
  tarifPerJam: number,
  paket?: Paket | null
): { cost: number; isOvertime: boolean; overtimeSeconds: number } {
  if (paket) {
    const paketSeconds = paket.durasi_menit * 60;
    if (seconds <= paketSeconds) {
      return { cost: paket.harga, isOvertime: false, overtimeSeconds: 0 };
    } else {
      const extraSeconds = seconds - paketSeconds;
      const extraHours = extraSeconds / 3600;
      // Overtime dikenakan tarif reguler per jam
      const overtimeCost = Math.ceil((extraHours * tarifPerJam) / 500) * 500;
      return {
        cost: paket.harga + overtimeCost,
        isOvertime: true,
        overtimeSeconds: extraSeconds,
      };
    }
  }

  // Tarif normal per jam
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  // Minimal charge 15 menit
  const billableMinutes = Math.max(15, minutes);
  const rawCost = (billableMinutes / 60) * tarifPerJam;
  const roundedCost = Math.ceil(rawCost / 500) * 500; // bulatkan ke 500 terdekat

  return { cost: roundedCost, isOvertime: false, overtimeSeconds: 0 };
}

export function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const content = [
    headers.join(','),
    ...rows.map(row =>
      row
        .map(cell => {
          const str = String(cell ?? '').replace(/"/g, '""');
          return `"${str}"`;
        })
        .join(',')
    ),
  ].join('\r\n');

  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
