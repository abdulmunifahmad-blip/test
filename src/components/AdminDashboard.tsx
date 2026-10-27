import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  Printer,
  RefreshCw,
  PlusCircle,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Flame,
  User,
  Phone,
  Home,
  Calendar,
  Sparkles,
  Shield,
  Layers,
  ChevronDown,
  X,
  Eye,
  SlidersHorizontal,
  BarChart3,
  PieChart,
} from 'lucide-react';
import {
  Complaint,
  ComplaintStatus,
  ComplaintCategory,
  ComplaintPriority,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  CATEGORY_LABELS,
  RESIDENTIAL_BLOCKS,
} from '../types';
import {
  subscribeToComplaints,
  seedSampleComplaintsIfEmpty,
} from '../services/complaintService';
import { ComplaintDetailsModal } from './ComplaintDetailsModal';

interface AdminDashboardProps {
  adminEmail: string | null;
  adminName: string;
  onOpenPrintReport: (complaints: Complaint[], filterSummary: string) => void;
  onOpenPrintSlip: (complaint: Complaint) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  adminEmail,
  adminName,
  onOpenPrintReport,
  onOpenPrintSlip,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [isSeeding, setIsSeeding] = useState(false);
  const [showCharts, setShowCharts] = useState(true);

  // Real-time Firestore subscription
  useEffect(() => {
    setIsLoading(true);
    setLoadError(null);

    const unsubscribe = subscribeToComplaints(
      (data) => {
        setComplaints(data);
        setIsLoading(false);
      },
      (err) => {
        console.error('Subscription error in AdminDashboard:', err);
        setLoadError('Gagal memuatkan rekod aduan dari Firestore. Sila pastikan anda mempunyai kebenaran pentadbir.');
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Quick Seed Handler
  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      await seedSampleComplaintsIfEmpty();
    } catch (err: any) {
      console.error('Seed error:', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Filtered Complaints calculation
  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      // Search text filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesRef = (item.referenceNumber || '').toLowerCase().includes(query);
        const matchesName = (item.fullName || '').toLowerCase().includes(query);
        const matchesPhone = (item.phoneNumber || '').toLowerCase().includes(query);
        const matchesUnit = (item.unitNumber || '').toLowerCase().includes(query);
        const matchesTitle = (item.title || '').toLowerCase().includes(query);
        const matchesDesc = (item.description || '').toLowerCase().includes(query);
        const matchesAssignee = (item.assignedTo || '').toLowerCase().includes(query);

        if (!matchesRef && !matchesName && !matchesPhone && !matchesUnit && !matchesTitle && !matchesDesc && !matchesAssignee) {
          return false;
        }
      }

      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }

      // Block filter
      if (selectedBlock !== 'all' && item.block !== selectedBlock) {
        return false;
      }

      // Priority filter
      if (selectedPriority !== 'all' && item.priority !== selectedPriority) {
        return false;
      }

      return true;
    });
  }, [complaints, searchQuery, selectedStatus, selectedCategory, selectedBlock, selectedPriority]);

  // Key Metrics
  const metrics = useMemo(() => {
    const total = complaints.length;
    const baru = complaints.filter((c) => c.status === 'Baru').length;
    const dalamTindakan = complaints.filter((c) => c.status === 'Dalam Tindakan').length;
    const menunggu = complaints.filter((c) => c.status === 'Menunggu Maklumat').length;
    const selesai = complaints.filter((c) => c.status === 'Selesai').length;
    const rate = total > 0 ? Math.round((selesai / total) * 100) : 0;
    return { total, baru, dalamTindakan, menunggu, selesai, rate };
  }, [complaints]);

  // Breakdown by Category
  const categoryStats = useMemo(() => {
    const counts: Record<string, number> = {
      facilities: 0,
      cleanliness: 0,
      security: 0,
      parking: 0,
      maintenance: 0,
      other: 0,
    };
    complaints.forEach((c) => {
      if (counts[c.category] !== undefined) {
        counts[c.category]++;
      } else {
        counts.other++;
      }
    });
    return counts;
  }, [complaints]);

  // Breakdown by Block
  const blockStats = useMemo(() => {
    const counts: Record<string, number> = {};
    complaints.forEach((c) => {
      const b = c.block || 'Lain-lain';
      counts[b] = (counts[b] || 0) + 1;
    });
    return counts;
  }, [complaints]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (filteredComplaints.length === 0) {
      alert('Tiada data untuk dieksport berdasarkan tapisan semasa.');
      return;
    }

    const headers = [
      'No. Rujukan',
      'Tarikh Aduan',
      'Nama Pengadu',
      'Nombor Telefon',
      'Blok',
      'No. Unit',
      'Kategori',
      'Tajuk Aduan',
      'Keterangan',
      'Keutamaan',
      'Pegawai Ditugaskan',
      'Status',
      'Tindakan Diambil',
      'Nota Pentadbir',
    ];

    const rows = filteredComplaints.map((c) => [
      `"${c.referenceNumber || ''}"`,
      `"${c.submissionDate || ''}"`,
      `"${(c.fullName || '').replace(/"/g, '""')}"`,
      `"${c.phoneNumber || ''}"`,
      `"${c.block || ''}"`,
      `"${c.unitNumber || ''}"`,
      `"${CATEGORY_LABELS[c.category]?.label || c.category}"`,
      `"${(c.title || '').replace(/"/g, '""')}"`,
      `"${(c.description || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${c.priority || 'Sederhana'}"`,
      `"${(c.assignedTo || '').replace(/"/g, '""')}"`,
      `"${c.status || ''}"`,
      `"${(c.actionTaken || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
      `"${(c.adminNotes || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute(
      'download',
      `Laporan_Aduan_SPAK_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('all');
    setSelectedCategory('all');
    setSelectedBlock('all');
    setSelectedPriority('all');
  };

  const getFilterSummary = () => {
    const parts = [];
    if (selectedStatus !== 'all') parts.push(`Status: ${selectedStatus}`);
    if (selectedCategory !== 'all') parts.push(`Kategori: ${CATEGORY_LABELS[selectedCategory as ComplaintCategory]?.label || selectedCategory}`);
    if (selectedBlock !== 'all') parts.push(`Blok: ${selectedBlock}`);
    if (selectedPriority !== 'all') parts.push(`Keutamaan: ${selectedPriority}`);
    if (searchQuery.trim()) parts.push(`Carian: "${searchQuery}"`);
    return parts.length > 0 ? parts.join(' | ') : 'Semua Rekod Aduan';
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Banner & Control Actions */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold mb-2">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              <span>Papan Kawalan Pentadbir Sah Komuniti (JMB / MC)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Papan Pemuka Pengurusan Aduan
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Pantau status tindakan, agihkan tugasan kerosakan, dan jana laporan aduan penduduk secara telus.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setShowCharts(!showCharts)}
              className="px-3.5 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>{showCharts ? 'Sembunyi Analisis' : 'Papar Analisis'}</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Eksport CSV</span>
            </button>

            <button
              onClick={() => onOpenPrintReport(filteredComplaints, getFilterSummary())}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4 text-slate-300" />
              <span>Cetak Laporan Rasmi</span>
            </button>

            {complaints.length === 0 && (
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs disabled:opacity-60"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSeeding ? 'Memasukkan Data...' : 'Muat Data Contoh'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {loadError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Ralat Akses Pangkalan Data</p>
            <p>{loadError}</p>
          </div>
        </div>
      )}

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase">Jumlah Aduan</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-slate-900">{metrics.total}</div>
          <p className="text-[11px] text-slate-500 mt-1">Semua kategori</p>
        </div>

        {/* Baru */}
        <div className="bg-white border border-blue-200 rounded-xl p-4 shadow-xs bg-blue-50/20">
          <div className="flex items-center justify-between text-blue-700 mb-2">
            <span className="text-xs font-semibold uppercase">Baru Diterima</span>
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          </div>
          <div className="text-2xl font-black text-blue-900">{metrics.baru}</div>
          <p className="text-[11px] text-blue-600 mt-1">Perlu semakan segera</p>
        </div>

        {/* Dalam Tindakan */}
        <div className="bg-white border border-amber-200 rounded-xl p-4 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-amber-800 mb-2">
            <span className="text-xs font-semibold uppercase">Dalam Tindakan</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-900">{metrics.dalamTindakan}</div>
          <p className="text-[11px] text-amber-700 mt-1">Sedang dibaiki/disiasat</p>
        </div>

        {/* Menunggu Maklumat */}
        <div className="bg-white border border-purple-200 rounded-xl p-4 shadow-xs bg-purple-50/20">
          <div className="flex items-center justify-between text-purple-700 mb-2">
            <span className="text-xs font-semibold uppercase">Menunggu Info</span>
            <Layers className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-black text-purple-900">{metrics.menunggu}</div>
          <p className="text-[11px] text-purple-600 mt-1">Sebut harga / maklum balas</p>
        </div>

        {/* Selesai */}
        <div className="bg-white border border-emerald-200 rounded-xl p-4 shadow-xs bg-emerald-50/20">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-semibold uppercase">Selesai</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900">{metrics.selesai}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Kes berjaya ditutup</p>
        </div>

        {/* Kadar Penyelesaian */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs bg-slate-50/40">
          <div className="flex items-center justify-between text-slate-600 mb-2">
            <span className="text-xs font-semibold uppercase">Penyelesaian</span>
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{metrics.rate}%</div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.rate}%` }}
            />
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      {showCharts && complaints.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Chart 1: Kategori Aduan */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                Agihan Mengikut Kategori
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Berdasarkan rekod</span>
            </div>

            <div className="space-y-3">
              {(
                [
                  { key: 'facilities', label: 'Kemudahan Bersama', color: 'bg-indigo-500' },
                  { key: 'cleanliness', label: 'Kebersihan', color: 'bg-teal-500' },
                  { key: 'security', label: 'Keselamatan', color: 'bg-red-500' },
                  { key: 'parking', label: 'Tempat Letak Kereta', color: 'bg-amber-500' },
                  { key: 'maintenance', label: 'Penyelenggaraan & M&E', color: 'bg-blue-600' },
                  { key: 'other', label: 'Lain-lain', color: 'bg-slate-400' },
                ] as const
              ).map((cat) => {
                const count = categoryStats[cat.key] || 0;
                const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={cat.key}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700">{cat.label}</span>
                      <span className="font-bold text-slate-900">
                        {count} <span className="text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${cat.color} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Status Aduan Semasa */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-emerald-600" />
                Pecahan Status Aduan
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">{metrics.total} Jumlah</span>
            </div>

            <div className="space-y-3">
              {[
                { status: 'Baru', count: metrics.baru, bg: 'bg-blue-500', text: 'text-blue-700' },
                { status: 'Dalam Tindakan', count: metrics.dalamTindakan, bg: 'bg-amber-500', text: 'text-amber-700' },
                { status: 'Menunggu Maklumat', count: metrics.menunggu, bg: 'bg-purple-500', text: 'text-purple-700' },
                { status: 'Selesai', count: metrics.selesai, bg: 'bg-emerald-500', text: 'text-emerald-700' },
              ].map((s) => {
                const pct = metrics.total > 0 ? Math.round((s.count / metrics.total) * 100) : 0;
                return (
                  <div key={s.status} className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${s.bg}`} />
                        <span className="font-semibold text-slate-800">{s.status}</span>
                      </div>
                      <span className="font-bold text-slate-900">
                        {s.count} kes ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
                      <div
                        className={`${s.bg} h-full rounded-full transition-all duration-300`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 3: Taburan Mengikut Blok */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-600" />
                Taburan Mengikut Blok
              </h3>
              <span className="text-[11px] text-slate-400 font-medium">Zon Kediaman</span>
            </div>

            <div className="space-y-2.5">
              {RESIDENTIAL_BLOCKS.map((blockName) => {
                const count = blockStats[blockName] || 0;
                const pct = metrics.total > 0 ? Math.round((count / metrics.total) * 100) : 0;
                return (
                  <div key={blockName} className="text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-700">{blockName}</span>
                      <span className="font-bold text-slate-900">{count} aduan</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nombor rujukan, nama pengadu, nombor telefon, unit atau tajuk..."
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-shadow"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {(selectedStatus !== 'all' ||
              selectedCategory !== 'all' ||
              selectedBlock !== 'all' ||
              selectedPriority !== 'all' ||
              searchQuery) && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span>Set Semula Tapisan</span>
              </button>
            )}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 border-t border-slate-100">
          {/* Status */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Status Aduan
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Status</option>
              <option value="Baru">Baru Diterima</option>
              <option value="Dalam Tindakan">Dalam Tindakan</option>
              <option value="Menunggu Maklumat">Menunggu Maklumat</option>
              <option value="Selesai">Selesai</option>
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Kategori
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Kategori</option>
              <option value="facilities">Kemudahan Bersama</option>
              <option value="cleanliness">Kebersihan</option>
              <option value="security">Keselamatan</option>
              <option value="parking">Tempat Letak Kereta</option>
              <option value="maintenance">Penyelenggaraan & M&E</option>
              <option value="other">Lain-lain</option>
            </select>
          </div>

          {/* Block */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Blok Kediaman
            </label>
            <select
              value={selectedBlock}
              onChange={(e) => setSelectedBlock(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Blok</option>
              {RESIDENTIAL_BLOCKS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Tahap Keutamaan
            </label>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-2.5 py-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-800 font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">Semua Keutamaan</option>
              <option value="Kecemasan">Kecemasan</option>
              <option value="Tinggi">Tinggi</option>
              <option value="Sederhana">Sederhana</option>
              <option value="Rendah">Rendah</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table / List Section */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Table Header Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Senarai Rekod Aduan
            </h2>
            <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full">
              {filteredComplaints.length} Rekod
            </span>
          </div>

          <div className="text-xs text-slate-500">
            Disusun mengikut tarikh terkini
          </div>
        </div>

        {/* Loading Spinner */}
        {isLoading ? (
          <div className="p-16 text-center text-slate-500 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-emerald-600" />
            <p className="text-sm font-semibold">Menyegerak data aduan dari Firestore...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tiada Rekod Aduan Dijumpai</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {complaints.length === 0
                ? 'Belum ada sebarang aduan dikemukakan oleh penduduk. Anda boleh memasukkan data contoh untuk tujuan demonstrasi.'
                : 'Tiada aduan yang sepadan dengan kriteria carian dan tapisan anda. Cuba set semula tapisan.'}
            </p>
            {complaints.length === 0 && (
              <button
                onClick={handleSeedData}
                disabled={isSeeding}
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isSeeding ? 'Memuatkan...' : 'Muat 6 Rekod Aduan Contoh'}</span>
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-100/70 text-slate-700 text-[11px] uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">No. Rujukan</th>
                  <th className="py-3.5 px-4">Tarikh</th>
                  <th className="py-3.5 px-4">Pengadu & Unit</th>
                  <th className="py-3.5 px-4">Kategori & Tajuk</th>
                  <th className="py-3.5 px-4">Keutamaan</th>
                  <th className="py-3.5 px-4">Pegawai / Pasukan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Tindakan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((item) => {
                  const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG['Baru'];
                  const priorityInfo = item.priority ? PRIORITY_CONFIG[item.priority] : PRIORITY_CONFIG['Sederhana'];
                  const catInfo = CATEGORY_LABELS[item.category] || CATEGORY_LABELS.other;

                  return (
                    <tr
                      key={item.id || item.referenceNumber}
                      onClick={() => setSelectedComplaint(item)}
                      className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                    >
                      {/* Reference Number */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                        <span className="hover:text-emerald-700">{item.referenceNumber}</span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap text-xs">
                        {item.submissionDate?.split(',')[0]}
                      </td>

                      {/* Resident Info */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{item.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                          {item.block}, {item.unitNumber}
                        </div>
                      </td>

                      {/* Category & Title */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 inline-block mb-0.5">
                          {catInfo.label}
                        </span>
                        <p className="font-bold text-slate-900 line-clamp-1 text-xs sm:text-sm">
                          {item.title}
                        </p>
                      </td>

                      {/* Priority */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[11px] font-bold border ${priorityInfo.badge}`}
                        >
                          {priorityInfo.label}
                        </span>
                      </td>

                      {/* Assigned Officer */}
                      <td className="py-3.5 px-4 text-xs text-slate-700 whitespace-nowrap">
                        {item.assignedTo || (
                          <span className="text-slate-400 italic">Belum Ditugaskan</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComplaint(item);
                          }}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-600 hover:text-white rounded-lg text-xs font-semibold text-slate-700 transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Urus</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complaint Details Modal */}
      {selectedComplaint && (
        <ComplaintDetailsModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          onUpdated={() => {
            // Updated in Firestore, subscription will update state automatically
          }}
          onPrintSlip={(c) => onOpenPrintSlip(c)}
          adminName={adminName}
        />
      )}
    </div>
  );
};
