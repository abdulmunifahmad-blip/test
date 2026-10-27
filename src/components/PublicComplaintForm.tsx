import React, { useState, useRef } from 'react';
import {
  Building2,
  Sparkles,
  ShieldAlert,
  Car,
  Wrench,
  HelpCircle,
  Upload,
  CheckCircle2,
  Copy,
  Check,
  Printer,
  AlertCircle,
  Loader2,
  X,
  FileText,
  Calendar,
  Phone,
  User,
  Home,
  Camera,
} from 'lucide-react';
import {
  ComplaintCategory,
  ComplaintFormData,
  Complaint,
  CATEGORY_LABELS,
  RESIDENTIAL_BLOCKS,
} from '../types';
import { submitComplaint, compressImageFile } from '../services/complaintService';

interface PublicComplaintFormProps {
  onSuccessComplaint: (complaint: Complaint) => void;
  onGoToStatusCheck: (refNumber: string) => void;
  onPrintSlip: (complaint: Complaint) => void;
}

export const PublicComplaintForm: React.FC<PublicComplaintFormProps> = ({
  onSuccessComplaint,
  onGoToStatusCheck,
  onPrintSlip,
}) => {
  const [formData, setFormData] = useState<ComplaintFormData>({
    fullName: '',
    phoneNumber: '',
    block: '',
    unitNumber: '',
    category: 'facilities',
    title: '',
    description: '',
    photoFile: null,
    photoBase64: '',
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedComplaint, setSubmittedComplaint] = useState<Complaint | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Current formatted date in Malay
  const todayFormatted = new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  const handleCategorySelect = (category: ComplaintCategory) => {
    setFormData((prev) => ({ ...prev, category }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setErrorMessage(null);
      const compressedDataUrl = await compressImageFile(file, 1000, 0.75);
      setImagePreview(compressedDataUrl);
      setFormData((prev) => ({
        ...prev,
        photoFile: file,
        photoBase64: compressedDataUrl,
      }));
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal memproses fail imej.');
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setFormData((prev) => ({
      ...prev,
      photoFile: null,
      photoBase64: '',
    }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Basic frontend validations
    if (!formData.fullName.trim()) {
      setErrorMessage('Sila masukkan nama penuh anda.');
      return;
    }
    if (!formData.phoneNumber.trim()) {
      setErrorMessage('Sila masukkan nombor telefon yang boleh dihubungi.');
      return;
    }
    if (!formData.block) {
      setErrorMessage('Sila pilih blok kediaman anda.');
      return;
    }
    if (!formData.unitNumber.trim()) {
      setErrorMessage('Sila masukkan nombor unit kediaman (contoh: A-12-03).');
      return;
    }
    if (!formData.title.trim()) {
      setErrorMessage('Sila nyatakan tajuk aduan.');
      return;
    }
    if (!formData.description.trim()) {
      setErrorMessage('Sila berikan keterangan terperinci mengenai aduan anda.');
      return;
    }

    try {
      setIsSubmitting(true);
      const newComplaint = await submitComplaint(formData);
      setSubmittedComplaint(newComplaint);
      onSuccessComplaint(newComplaint);
    } catch (err: any) {
      console.error('Submission error:', err);
      setErrorMessage(
        err.message || 'Berlaku ralat semasa menghantar aduan. Sila cuba lagi atau hubungi pejabat pengurusan.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyReference = () => {
    if (!submittedComplaint?.referenceNumber) return;
    navigator.clipboard.writeText(submittedComplaint.referenceNumber);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleResetForm = () => {
    setSubmittedComplaint(null);
    setFormData({
      fullName: '',
      phoneNumber: '',
      block: '',
      unitNumber: '',
      category: 'facilities',
      title: '',
      description: '',
      photoFile: null,
      photoBase64: '',
    });
    setImagePreview(null);
    setErrorMessage(null);
  };

  // Render Success Receipt View
  if (submittedComplaint) {
    return (
      <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-6 sm:p-8 text-center relative">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Aduan Berjaya Dihantar!
            </h2>
            <p className="text-emerald-100 text-sm mt-1 max-w-lg mx-auto">
              Aduan anda telah direkodkan secara rasmi ke dalam sistem pengurusan Kondominium Seri Mutiara.
            </p>
          </div>

          {/* Reference Number Card */}
          <div className="p-6 sm:p-8">
            <div className="bg-slate-50 border-2 border-dashed border-emerald-300 rounded-xl p-5 text-center mb-6">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Nombor Rujukan Aduan Anda
              </span>
              <div className="text-2xl sm:text-3xl font-mono font-extrabold text-slate-900 mt-1 mb-2 tracking-wider">
                {submittedComplaint.referenceNumber}
              </div>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-3">
                Sila simpan nombor rujukan ini untuk semakan status dan perhubungan rasmi bersama pihak pengurusan.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={handleCopyReference}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{isCopied ? 'Telah Disalin!' : 'Salin No. Rujukan'}</span>
                </button>

                <button
                  onClick={() => onPrintSlip(submittedComplaint)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                >
                  <Printer className="w-4 h-4" />
                  <span>Cetak Slip Pengesahan</span>
                </button>
              </div>
            </div>

            {/* Complaint Summary */}
            <div className="border border-slate-200 rounded-xl p-5 mb-6 divide-y divide-slate-100 text-sm">
              <div className="pb-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-500 block">Nama Pengadu</span>
                  <span className="font-semibold text-slate-800">{submittedComplaint.fullName}</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Nombor Telefon</span>
                  <span className="font-semibold text-slate-800">{submittedComplaint.phoneNumber}</span>
                </div>
              </div>

              <div className="py-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-xs text-slate-500 block">Lokasi Unit</span>
                  <span className="font-semibold text-slate-800">
                    {submittedComplaint.block}, Unit {submittedComplaint.unitNumber}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Kategori Aduan</span>
                  <span className="font-semibold text-slate-800">
                    {CATEGORY_LABELS[submittedComplaint.category]?.label || submittedComplaint.category}
                  </span>
                </div>
              </div>

              <div className="py-3">
                <span className="text-xs text-slate-500 block">Tajuk Aduan</span>
                <span className="font-semibold text-slate-800">{submittedComplaint.title}</span>
              </div>

              <div className="py-3">
                <span className="text-xs text-slate-500 block">Keterangan Aduan</span>
                <p className="text-slate-700 whitespace-pre-line text-xs sm:text-sm mt-0.5">
                  {submittedComplaint.description}
                </p>
              </div>

              <div className="pt-3 flex items-center justify-between text-xs text-slate-500">
                <span>Tarikh & Masa: {submittedComplaint.submissionDate}</span>
                <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                  Status: Baru Diterima
                </span>
              </div>
            </div>

            {/* Next Step Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleResetForm}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
              >
                Hantar Aduan Lain
              </button>
              <button
                onClick={() => onGoToStatusCheck(submittedComplaint.referenceNumber)}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold shadow transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-4 h-4" />
                <span>Semak Status Aduan Ini</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render Form View
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Introduction Card */}
      <div className="mb-6 bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Portal Awam Penduduk Kondominium Seri Mutiara</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Borang Penyerahan Aduan Kediaman
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Kemukakan aduan mengenai kemudahan, kebersihan, keselamatan, tempat letak kereta, atau kerosakan unit bersama tanpa perlu mendaftar akaun.
            </p>
          </div>
          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-3 sm:text-right shrink-0">
            <span className="block font-semibold text-slate-700">Tarikh Semasa</span>
            <span className="flex items-center gap-1 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600" />
              {todayFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-800 text-sm">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Perhatian</p>
            <p>{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-700 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Complaint Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Section 1: Resident Information */}
        <div className="p-6 sm:p-8 border-b border-slate-100">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h2 className="text-lg font-bold text-slate-900">Maklumat Pengadu & Kediaman</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Penuh Pengadu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="cth: Ahmad Faiz bin Zulkifli"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombor Telefon (Malaysia) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  required
                  value={formData.phoneNumber}
                  onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                  placeholder="cth: 012-3456789"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                />
              </div>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Pihak pengurusan akan menghubungi nombor ini untuk maklum balas.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Blok Kediaman <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Home className="w-4 h-4" />
                </div>
                <select
                  required
                  value={formData.block}
                  onChange={(e) => setFormData({ ...formData, block: e.target.value })}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
                >
                  <option value="">-- Sila Pilih Blok --</option>
                  {RESIDENTIAL_BLOCKS.map((block) => (
                    <option key={block} value={block}>
                      {block}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Nombor Unit Kediaman <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                placeholder="cth: B-14-08 atau A-03-02"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Complaint Category */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h2 className="text-lg font-bold text-slate-900">Kategori Aduan</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4 ml-9">
            Pilih kategori yang paling tepat bagi membolehkan aduan disalurkan terus kepada pegawai bertanggungjawab.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(
              [
                { key: 'facilities', icon: Building2 },
                { key: 'cleanliness', icon: Sparkles },
                { key: 'security', icon: ShieldAlert },
                { key: 'parking', icon: Car },
                { key: 'maintenance', icon: Wrench },
                { key: 'other', icon: HelpCircle },
              ] as const
            ).map(({ key, icon: Icon }) => {
              const info = CATEGORY_LABELS[key];
              const isSelected = formData.category === key;
              return (
                <div
                  key={key}
                  onClick={() => handleCategorySelect(key)}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs sm:text-sm text-slate-900 block leading-tight">
                        {info.label}
                      </span>
                      <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                        {info.description}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 3: Complaint Details */}
        <div className="p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h2 className="text-lg font-bold text-slate-900">Perincian Aduan</h2>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tajuk Aduan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="cth: Lif Penumpang Nombor 2 Tersekat dan Berbunyi Bising"
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Keterangan Terperinci Aduan <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Sila nyatakan masa kejadian, lokasi tepat (contohnya aras atau koridor berhampiran nombor unit tertentu), dan butiran kerosakan secara terperinci..."
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
              />
            </div>

            {/* Photo Evidence Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Bukti Gambar (Pilihan)
              </label>
              
              {!imagePreview ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-emerald-50/30 group"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-100 group-hover:bg-emerald-100 text-slate-500 group-hover:text-emerald-600 flex items-center justify-center mx-auto mb-2 transition-colors">
                    <Camera className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    Klik untuk muat naik gambar bukti kerosakan
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Format disokong: JPG, PNG, WebP (Maksimum 10MB, akan dioptimumkan secara automatik)
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              ) : (
                <div className="relative border border-slate-200 rounded-xl p-3 bg-slate-50 flex items-center gap-4">
                  <img
                    src={imagePreview}
                    alt="Pratonton Bukti Aduan"
                    className="w-24 h-24 object-cover rounded-lg border border-slate-200 shadow-sm"
                  />
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-800">
                      Gambar Bukti Telah Dimuat Naik
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Imej dioptimumkan dan sedia untuk dihantar bersama aduan.
                    </p>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="mt-2 text-xs font-medium text-red-600 hover:text-red-700 flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Padam Gambar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer & Submit Button */}
        <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500 text-center sm:text-left">
            Dengan menghantar borang ini, anda mengesahkan maklumat yang diberikan adalah benar untuk tindakan pengurusan.
          </p>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Menghantar Aduan ke Firestore...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Hantar Aduan Rasmi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
