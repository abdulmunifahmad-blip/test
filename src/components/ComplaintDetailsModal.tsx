import React, { useState } from 'react';
import {
  X,
  User,
  Phone,
  Home,
  Calendar,
  Clock,
  Shield,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Save,
  Loader2,
  ExternalLink,
  MessageSquare,
  ClipboardList,
} from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  ComplaintPriority,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
  ASSIGNED_TEAMS,
} from '../types';
import { updateComplaintDetails } from '../services/complaintService';

interface ComplaintDetailsModalProps {
  complaint: Complaint | null;
  onClose: () => void;
  onUpdated: () => void;
  onPrintSlip: (complaint: Complaint) => void;
  adminName: string;
}

export const ComplaintDetailsModal: React.FC<ComplaintDetailsModalProps> = ({
  complaint,
  onClose,
  onUpdated,
  onPrintSlip,
  adminName,
}) => {
  if (!complaint) return null;

  const [status, setStatus] = useState<ComplaintStatus>(complaint.status);
  const [priority, setPriority] = useState<ComplaintPriority>(complaint.priority || 'Sederhana');
  const [assignedTo, setAssignedTo] = useState<string>(complaint.assignedTo || 'Belum Ditugaskan');
  const [customAssigned, setCustomAssigned] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>(complaint.adminNotes || '');
  const [actionTaken, setActionTaken] = useState<string>(complaint.actionTaken || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint.id && !complaint.referenceNumber) return;
    const targetId = complaint.id || complaint.referenceNumber;

    setSaveError(null);
    setSaveSuccess(false);
    setIsSaving(true);

    try {
      const finalAssignedTo = assignedTo === 'Lain-lain' && customAssigned.trim()
        ? customAssigned.trim()
        : assignedTo;

      await updateComplaintDetails(
        targetId,
        {
          status,
          priority,
          assignedTo: finalAssignedTo,
          adminNotes,
          actionTaken,
        },
        complaint,
        adminName
      );

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      onUpdated();
    } catch (err: any) {
      console.error('Update complaint error:', err);
      setSaveError(err.message || 'Gagal menyimpan kemas kini aduan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold bg-slate-800 text-emerald-400 px-2.5 py-0.5 rounded border border-slate-700">
                  {complaint.referenceNumber}
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    STATUS_CONFIG[complaint.status]?.bg || 'bg-slate-100'
                  } ${STATUS_CONFIG[complaint.status]?.text || 'text-slate-800'}`}
                >
                  {complaint.status}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white mt-1 line-clamp-1">
                {complaint.title}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPrintSlip(complaint)}
              title="Cetak Slip Aduan"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Notification Feedback */}
          {saveSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Kemas kini aduan berjaya disimpan ke Firestore dan direkodkan ke jejak audit!</span>
            </div>
          )}
          {saveError && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {/* Section: Complainant Information */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
              Maklumat Pengadu & Unit
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-slate-400 text-xs block">Nama Pengadu</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  {complaint.fullName}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Nombor Telefon</span>
                <a
                  href={`tel:${complaint.phoneNumber}`}
                  className="font-semibold text-emerald-700 hover:underline flex items-center gap-1.5 mt-0.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {complaint.phoneNumber}
                </a>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Lokasi Unit</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Home className="w-3.5 h-3.5 text-slate-500" />
                  {complaint.block}, Unit {complaint.unitNumber}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-xs block">Tarikh Dihantar</span>
                <span className="font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  {complaint.submissionDate}
                </span>
              </div>
            </div>
          </div>

          {/* Section: Complaint Content & Photo Evidence */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Kategori & Tajuk
                </span>
                <div className="p-3 bg-white border border-slate-200 rounded-xl">
                  <span className="text-xs font-semibold text-emerald-700 block mb-0.5">
                    {CATEGORY_LABELS[complaint.category]?.label || complaint.category}
                  </span>
                  <p className="text-sm font-bold text-slate-900">{complaint.title}</p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                  Keterangan Terperinci Penduduk
                </span>
                <div className="p-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {complaint.description}
                </div>
              </div>
            </div>

            {/* Photo Evidence Box */}
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Bukti Gambar
              </span>
              {complaint.photoUrl ? (
                <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50 group relative">
                  <img
                    src={complaint.photoUrl}
                    alt="Bukti Aduan"
                    className="w-full h-44 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => setIsPhotoZoomed(true)}
                  />
                  <button
                    type="button"
                    onClick={() => setIsPhotoZoomed(true)}
                    className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-900/80 hover:bg-slate-900 text-white text-[11px] font-medium rounded-md backdrop-blur-xs flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Besarkan
                  </button>
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 rounded-xl p-8 text-center text-xs text-slate-400 bg-slate-50 h-44 flex flex-col items-center justify-center">
                  <FileText className="w-8 h-8 text-slate-300 mb-1" />
                  <span>Tiada gambar bukti dilampirkan</span>
                </div>
              )}
            </div>
          </div>

          {/* Form: Admin Update Actions */}
          <form onSubmit={handleSave} className="bg-emerald-50/40 border border-emerald-200 rounded-xl p-5 space-y-5">
            <div className="flex items-center gap-2 border-b border-emerald-200/60 pb-3">
              <Wrench className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-emerald-950">
                Pusat Tindakan & Pengurusan Pentadbir
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Status Update */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Status Aduan <span className="text-red-500">*</span>
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Baru">Baru Diterima</option>
                  <option value="Dalam Tindakan">Dalam Tindakan</option>
                  <option value="Menunggu Maklumat">Menunggu Maklumat</option>
                  <option value="Selesai">Selesai</option>
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tahap Keutamaan
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Rendah">Rendah</option>
                  <option value="Sederhana">Sederhana</option>
                  <option value="Tinggi">Tinggi</option>
                  <option value="Kecemasan">Kecemasan</option>
                </select>
              </div>

              {/* Assigned Officer / Team */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tugaskan Pegawai / Pasukan
                </label>
                <select
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-slate-800 text-xs sm:text-sm bg-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Belum Ditugaskan">-- Belum Ditugaskan --</option>
                  {ASSIGNED_TEAMS.map((team) => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                  <option value="Lain-lain">Lain-lain (Nama Khusus)</option>
                </select>
                {assignedTo === 'Lain-lain' && (
                  <input
                    type="text"
                    value={customAssigned}
                    onChange={(e) => setCustomAssigned(e.target.value)}
                    placeholder="Masukkan nama pegawai..."
                    className="mt-2 w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-white"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Action Taken */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tindakan Diambil (Boleh Dilihat Oleh Penduduk)
                </label>
                <textarea
                  rows={3}
                  value={actionTaken}
                  onChange={(e) => setActionTaken(e.target.value)}
                  placeholder="cth: Juruteknik telah membaiki sambungan paip dan pemeriksaan tekanan air menunjukkan normal..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nota Pentadbir (Catatan Dalaman JMB/MC)
                </label>
                <textarea
                  rows={3}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="cth: Kos alat ganti RM150 akan dicaj di bawah peruntukan akaun sinking fund Zon C..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 text-slate-800 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white text-xs sm:text-sm font-bold rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Simpan Kemas Kini Aduan</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Section: Status Change History Audit Trail */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Jejak Audit & Sejarah Status ({complaint.history?.length || 0})
            </h3>
            {complaint.history && complaint.history.length > 0 ? (
              <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden bg-white">
                {complaint.history.map((h, i) => (
                  <div key={i} className="p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {h.previousStatus} &rarr; {h.newStatus}
                          </span>
                          <span className="text-[11px] text-slate-500">
                            oleh <span className="font-semibold text-slate-700">{h.updatedBy}</span>
                          </span>
                        </div>
                        {h.notes && (
                          <p className="text-slate-600 text-[11px] mt-0.5">{h.notes}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono shrink-0">
                      {h.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">Tiada rekod perubahan terdahulu.</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            Sebarang perubahan disimpan kekal ke dalam pangkalan data Firestore.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Photo Modal Zoom */}
      {isPhotoZoomed && complaint.photoUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setIsPhotoZoomed(false)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center">
            <button
              onClick={() => setIsPhotoZoomed(false)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1"
            >
              <X className="w-8 h-8" />
            </button>
            <img
              src={complaint.photoUrl}
              alt="Bukti Aduan Diperbesarkan"
              className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
