import React from 'react';
import { Building2, Printer, ArrowLeft, Calendar, FileText } from 'lucide-react';
import { Complaint, CATEGORY_LABELS } from '../types';

interface PrintableReportProps {
  complaints: Complaint[];
  filterInfo: string;
  onBack: () => void;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  complaints,
  filterInfo,
  onBack,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const total = complaints.length;
  const baru = complaints.filter((c) => c.status === 'Baru').length;
  const dalamTindakan = complaints.filter((c) => c.status === 'Dalam Tindakan').length;
  const menunggu = complaints.filter((c) => c.status === 'Menunggu Maklumat').length;
  const selesai = complaints.filter((c) => c.status === 'Selesai').length;

  const today = new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6">
      {/* Control Buttons (Hidden on Print) */}
      <div className="max-w-6xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-50 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Papan Pemuka</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg text-xs sm:text-sm font-bold hover:bg-emerald-700 shadow transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak / Eksport PDF Laporan</span>
        </button>
      </div>

      {/* Report Sheet */}
      <div className="max-w-6xl mx-auto bg-white border border-slate-300 shadow-xl p-8 sm:p-12 rounded-xl text-slate-900 print:shadow-none print:border-none print:p-0">
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
                  Badan Pengurusan Bersama (JMB) &bull; Laporan Rasmi Aduan Komuniti Kediaman
                </p>
                <p className="text-[11px] text-slate-500">
                  Jalan Seri Mutiara 1, 47100 Puchong, Selangor Darul Ehsan
                </p>
              </div>
            </div>

            <div className="text-right text-xs text-slate-600">
              <span className="block font-bold text-slate-800">Tarikh Dijana:</span>
              <span>{today}</span>
              <span className="block text-[11px] text-slate-500 mt-1">
                Tapisan: {filterInfo || 'Semua Rekod'}
              </span>
            </div>
          </div>
        </div>

        {/* Executive Summary Metrics */}
        <div className="grid grid-cols-5 gap-3 mb-8">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Jumlah Rekod</span>
            <span className="text-xl font-black text-slate-900">{total}</span>
          </div>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center">
            <span className="text-[11px] font-bold text-blue-700 uppercase block">Baru</span>
            <span className="text-xl font-black text-blue-900">{baru}</span>
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
            <span className="text-[11px] font-bold text-amber-800 uppercase block">Dalam Tindakan</span>
            <span className="text-xl font-black text-amber-900">{dalamTindakan}</span>
          </div>
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-center">
            <span className="text-[11px] font-bold text-purple-700 uppercase block">Menunggu Maklumat</span>
            <span className="text-xl font-black text-purple-900">{menunggu}</span>
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-center">
            <span className="text-[11px] font-bold text-emerald-700 uppercase block">Selesai</span>
            <span className="text-xl font-black text-emerald-900">{selesai}</span>
          </div>
        </div>

        {/* Table of Complaints */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200 border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                <th className="p-2.5 border-r border-slate-200 w-12 text-center">Bil.</th>
                <th className="p-2.5 border-r border-slate-200 w-28">No. Rujukan</th>
                <th className="p-2.5 border-r border-slate-200 w-24">Tarikh</th>
                <th className="p-2.5 border-r border-slate-200 w-36">Pengadu & Unit</th>
                <th className="p-2.5 border-r border-slate-200 w-28">Kategori</th>
                <th className="p-2.5 border-r border-slate-200">Tajuk & Tindakan</th>
                <th className="p-2.5 border-r border-slate-200 w-32">Pegawai</th>
                <th className="p-2.5 w-24 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {complaints.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500 italic">
                    Tiada rekod aduan untuk tapisan ini.
                  </td>
                </tr>
              ) : (
                complaints.map((item, index) => (
                  <tr key={item.id || item.referenceNumber} className="hover:bg-slate-50">
                    <td className="p-2.5 border-r border-slate-200 text-center font-semibold text-slate-600">
                      {index + 1}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-mono font-bold text-slate-900">
                      {item.referenceNumber}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-600">
                      {item.submissionDate?.split(',')[0]}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-semibold text-slate-900">{item.fullName}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.block}, {item.unitNumber}
                      </div>
                    </td>
                    <td className="p-2.5 border-r border-slate-200 font-medium text-slate-700">
                      {CATEGORY_LABELS[item.category]?.label || item.category}
                    </td>
                    <td className="p-2.5 border-r border-slate-200">
                      <div className="font-bold text-slate-900">{item.title}</div>
                      {item.actionTaken && (
                        <div className="text-[11px] text-emerald-800 bg-emerald-50/80 p-1 rounded mt-1">
                          <span className="font-semibold">Tindakan: </span>
                          {item.actionTaken}
                        </div>
                      )}
                    </td>
                    <td className="p-2.5 border-r border-slate-200 text-slate-700">
                      {item.assignedTo || 'Belum Ditugaskan'}
                    </td>
                    <td className="p-2.5 text-center font-bold">
                      <span className="inline-block px-2 py-0.5 rounded text-[11px] border border-slate-300">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Signatures */}
        <div className="mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12 text-center text-xs">
          <div>
            <div className="h-16 border-b border-dashed border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-900">Pengurus Bangunan & Operasi</p>
            <p className="text-[11px] text-slate-500">Badan Pengurusan Bersama (JMB)</p>
          </div>

          <div>
            <div className="h-16 border-b border-dashed border-slate-400 mb-2"></div>
            <p className="font-bold text-slate-900">Pengerusi Jawatankuasa Pengurusan</p>
            <p className="text-[11px] text-slate-500">Kondominium Seri Mutiara</p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-[10px] text-slate-400 flex items-center justify-between">
          <span>Sistem Pengurusan Aduan Kediaman (SPAK) &bull; Versi Pengeluaran 2026</span>
          <span>Dokumen Rasmi Berkanun JMB/MC</span>
        </div>
      </div>
    </div>
  );
};
