import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Printer,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Calendar,
  UserCheck,
} from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Complaint, STATUS_CONFIG, CATEGORY_LABELS } from '../types';

interface PublicStatusCheckProps {
  initialRefNumber?: string;
  onPrintSlip: (complaint: Complaint) => void;
}

export const PublicStatusCheck: React.FC<PublicStatusCheckProps> = ({
  initialRefNumber = '',
  onPrintSlip,
}) => {
  const [refInput, setRefInput] = useState(initialRefNumber);
  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [foundComplaint, setFoundComplaint] = useState<Complaint | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRefNumber) {
      setRefInput(initialRefNumber);
    }
  }, [initialRefNumber]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchError(null);
    setFoundComplaint(null);

    const cleanRef = refInput.trim().toUpperCase();
    const cleanPhone = phoneInput.trim().replace(/[-\s]/g, '');

    if (!cleanRef) {
      setSearchError('Sila masukkan Nombor Rujukan Aduan anda (contoh: ADU-2026-10492).');
      return;
    }
    if (!cleanPhone) {
      setSearchError('Sila masukkan nombor telefon yang didaftarkan semasa membuat aduan.');
      return;
    }

    try {
      setIsLoading(true);
      const docRef = doc(db, 'complaints', cleanRef);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        setSearchError('Tiada rekod aduan dijumpai dengan nombor rujukan tersebut. Sila semak semula nombor anda.');
        return;
      }

      const data = docSnap.data() as Complaint;
      const registeredPhoneClean = (data.phoneNumber || '').trim().replace(/[-\s]/g, '');

      // Verify phone number for privacy protection
      if (cleanPhone !== registeredPhoneClean && !registeredPhoneClean.includes(cleanPhone)) {
        setSearchError('Nombor telefon tidak sepadan dengan nombor yang didaftarkan untuk aduan ini.');
        return;
      }

      setFoundComplaint({
        ...data,
        id: docSnap.id,
      });
    } catch (err: any) {
      console.error('Error checking status:', err);
      setSearchError('Gagal menyemak status aduan. Sila pastikan sambungan internet aktif dan cuba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStepStatus = (stepIndex: number, currentStatus: string) => {
    // 0: Baru, 1: Dalam Tindakan / Menunggu Maklumat, 2: Selesai
    if (currentStatus === 'Selesai') return 'completed';
    if (currentStatus === 'Dalam Tindakan' || currentStatus === 'Menunggu Maklumat') {
      if (stepIndex <= 1) return 'completed';
      return 'pending';
    }
    if (currentStatus === 'Baru') {
      if (stepIndex === 0) return 'completed';
      return 'pending';
    }
    return 'pending';
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Title Header */}
      <div className="mb-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Semakan Telus & Selamat Penduduk</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Semak Status Aduan Kediaman
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Masukkan nombor rujukan rasmi dan nombor telefon anda untuk melihat perkembangan terkini tindakan pihak pengurusan.
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombor Rujukan Aduan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={refInput}
                onChange={(e) => setRefInput(e.target.value)}
                placeholder="cth: ADU-2026-10492"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 font-mono text-sm uppercase placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombor Telefon Pengadu <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder="cth: 012-3456789"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-xs text-slate-500">
              Pengesahan nombor telefon diperlukan bagi melindungi privasi maklumat peribadi penduduk.
            </span>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-7 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyemak...</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Semak Status Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Error Notice */}
      {searchError && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm flex items-start gap-3 mb-6">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Makluman Carian</p>
            <p>{searchError}</p>
          </div>
        </div>
      )}

      {/* Found Complaint Status Result */}
      {foundComplaint && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden">
          {/* Status Banner */}
          <div className="p-6 bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-slate-800 px-2.5 py-1 rounded border border-slate-700 font-bold">
                  {foundComplaint.referenceNumber}
                </span>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    STATUS_CONFIG[foundComplaint.status]?.bg || 'bg-slate-100'
                  } ${STATUS_CONFIG[foundComplaint.status]?.text || 'text-slate-800'}`}
                >
                  {foundComplaint.status}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold mt-2 text-white">
                {foundComplaint.title}
              </h2>
            </div>

            <button
              onClick={() => onPrintSlip(foundComplaint)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Slip Aduan</span>
            </button>
          </div>

          {/* Stepper Status Progress */}
          <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/70">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-6">
              Tahap Kemajuan Tindakan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative">
              {/* Step 1 */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  getStepStatus(0, foundComplaint.status) === 'completed'
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    getStepStatus(0, foundComplaint.status) === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">1. Aduan Diterima</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {foundComplaint.submissionDate}
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  getStepStatus(1, foundComplaint.status) === 'completed'
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    getStepStatus(1, foundComplaint.status) === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">2. Dalam Tindakan</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {foundComplaint.assignedTo || 'Sedang disemak pegawai'}
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`p-4 rounded-xl border flex items-start gap-3 transition-colors ${
                  getStepStatus(2, foundComplaint.status) === 'completed'
                    ? 'bg-emerald-50 border-emerald-300'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    getStepStatus(2, foundComplaint.status) === 'completed'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-xs sm:text-sm text-slate-900">3. Selesai & Ditutup</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {foundComplaint.status === 'Selesai'
                      ? 'Tindakan lapangan telah selesai'
                      : 'Menanti penyelesaian'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 space-y-6">
            {/* Action Taken Banner if available */}
            {foundComplaint.actionTaken && (
              <div className="p-5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5 mb-1">
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  Tindakan Yang Telah Diambil Pihak Pengurusan:
                </span>
                <p className="text-sm text-emerald-950 font-medium whitespace-pre-line">
                  {foundComplaint.actionTaken}
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase">Lokasi Kediaman</span>
                <p className="font-medium text-slate-900 mt-0.5">
                  {foundComplaint.block}, Unit {foundComplaint.unitNumber}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase">Kategori Aduan</span>
                <p className="font-medium text-slate-900 mt-0.5">
                  {CATEGORY_LABELS[foundComplaint.category]?.label || foundComplaint.category}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase">Pegawai / Pasukan Bertugas</span>
                <p className="font-medium text-slate-900 mt-0.5">
                  {foundComplaint.assignedTo || 'Belum Ditugaskan'}
                </p>
              </div>

              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase">Tarikh Aduan</span>
                <p className="font-medium text-slate-900 mt-0.5">
                  {foundComplaint.submissionDate}
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-semibold block uppercase mb-1">Keterangan Asal Aduan</span>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 whitespace-pre-line">
                {foundComplaint.description}
              </div>
            </div>

            {/* History timeline */}
            {foundComplaint.history && foundComplaint.history.length > 0 && (
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase mb-2">Jejak Log Tindakan</span>
                <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
                  {foundComplaint.history.map((h, i) => (
                    <div key={i} className="p-3 text-xs flex items-start justify-between gap-3 bg-white">
                      <div>
                        <span className="font-semibold text-slate-800">{h.notes || h.newStatus}</span>
                        <span className="text-slate-500 block text-[11px] mt-0.5">
                          Oleh: {h.updatedBy}
                        </span>
                      </div>
                      <span className="text-slate-400 shrink-0 text-[11px] font-mono">
                        {h.timestamp}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
