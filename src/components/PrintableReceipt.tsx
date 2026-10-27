import React from 'react';
import { Building2, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Complaint, CATEGORY_LABELS, STATUS_CONFIG } from '../types';

interface PrintableReceiptProps {
  complaint: Complaint;
  onBack: () => void;
}

export const PrintableReceipt: React.FC<PrintableReceiptProps> = ({ complaint, onBack }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      {/* Control Buttons (Hidden during actual print) */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Sistem</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-emerald-700 shadow transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Simpan PDF</span>
        </button>
      </div>

      {/* Slip Document Sheet */}
      <div className="max-w-3xl mx-auto bg-white border border-slate-300 shadow-lg p-8 sm:p-12 rounded-xl text-slate-900 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="border-b-2 border-slate-900 pb-6 mb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
                <Building2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                  Kondominium Seri Mutiara
                </h1>
                <p className="text-xs text-slate-600 font-medium">
                  Badan Pengurusan Bersama (JMB) &bull; No. Pendaftaran: JMB/SEL/2021/0491
                </p>
                <p className="text-[11px] text-slate-500">
                  Jalan Seri Mutiara 1, 47100 Puchong, Selangor Darul Ehsan | Tel: 03-8070 1234
                </p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="inline-block bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg text-right">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">
                  Slip Akuan Aduan
                </span>
                <span className="font-mono font-black text-sm sm:text-base text-slate-900">
                  {complaint.referenceNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status & Priority Badge */}
        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500">STATUS SEMASA:</span>
            <span className="font-bold uppercase text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded">
              {complaint.status}
            </span>
          </div>
          <div>
            <span className="text-slate-500">Tarikh Penerimaan: </span>
            <span className="font-semibold text-slate-800">{complaint.submissionDate}</span>
          </div>
        </div>

        {/* Section 1: Resident & Unit Details */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-3">
            1. Butiran Pengadu & Kediaman
          </h2>
          <table className="w-full text-xs sm:text-sm">
            <tbody>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 w-1/3 font-medium">Nama Penuh Pengadu</td>
                <td className="py-2 text-slate-900 font-bold">{complaint.fullName}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-medium">Nombor Telefon</td>
                <td className="py-2 text-slate-900 font-semibold">{complaint.phoneNumber}</td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-medium">Blok & Nombor Unit</td>
                <td className="py-2 text-slate-900 font-bold">
                  {complaint.block}, Unit {complaint.unitNumber}
                </td>
              </tr>
              <tr className="border-b border-slate-100">
                <td className="py-2 text-slate-500 font-medium">Kategori Aduan</td>
                <td className="py-2 text-slate-900 font-semibold">
                  {CATEGORY_LABELS[complaint.category]?.label || complaint.category}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Complaint Description */}
        <div className="mb-6">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 pb-1 mb-3">
            2. Perincian Aduan
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div>
              <span className="text-slate-500 text-xs block font-medium">Tajuk Aduan</span>
              <p className="font-bold text-slate-900 mt-0.5">{complaint.title}</p>
            </div>
            <div>
              <span className="text-slate-500 text-xs block font-medium">Keterangan Terperinci</span>
              <p className="text-slate-800 whitespace-pre-line mt-0.5 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {complaint.description}
              </p>
            </div>
            {complaint.actionTaken && (
              <div>
                <span className="text-emerald-800 text-xs block font-bold">
                  Tindakan Terkini Pengurusan
                </span>
                <p className="text-emerald-950 whitespace-pre-line mt-0.5 leading-relaxed bg-emerald-50 p-3 rounded-lg border border-emerald-200 font-medium">
                  {complaint.actionTaken}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Section 3: Official Verification & Signatures */}
        <div className="mt-12 pt-6 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="h-16 border-b border-dashed border-slate-400 mb-2"></div>
              <p className="font-bold text-slate-800">Tandatangan Pengadu</p>
              <p className="text-[11px] text-slate-500">Nama: {complaint.fullName}</p>
            </div>

            <div>
              <div className="h-16 border-b border-dashed border-slate-400 mb-2"></div>
              <p className="font-bold text-slate-800">Pegawai Pengurusan Bangunan (JMB)</p>
              <p className="text-[11px] text-slate-500">Cop Rasmi & Tarikh</p>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center">
          Dokumen ini dijana secara berkomputer melalui Sistem Pengurusan Aduan Kediaman (SPAK). Tiada tandatangan fizikal diperlukan untuk pengesahan awal.
        </div>
      </div>
    </div>
  );
};
