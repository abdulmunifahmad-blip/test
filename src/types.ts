export type ComplaintCategory =
  | 'facilities'
  | 'cleanliness'
  | 'security'
  | 'parking'
  | 'maintenance'
  | 'other';

export type ComplaintStatus =
  | 'Baru'
  | 'Dalam Tindakan'
  | 'Menunggu Maklumat'
  | 'Selesai';

export type ComplaintPriority =
  | 'Rendah'
  | 'Sederhana'
  | 'Tinggi'
  | 'Kecemasan';

export interface StatusHistoryEntry {
  timestamp: string;
  previousStatus: ComplaintStatus | 'Permulaan';
  newStatus: ComplaintStatus;
  updatedBy: string;
  notes?: string;
}

export interface Complaint {
  id?: string;
  referenceNumber: string;
  fullName: string;
  phoneNumber: string;
  block: string;
  unitNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  photoUrl?: string;
  submissionDate: string;
  status: ComplaintStatus;
  priority?: ComplaintPriority;
  assignedTo?: string;
  adminNotes?: string;
  actionTaken?: string;
  history?: StatusHistoryEntry[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ComplaintFormData {
  fullName: string;
  phoneNumber: string;
  block: string;
  unitNumber: string;
  category: ComplaintCategory;
  title: string;
  description: string;
  photoFile?: File | null;
  photoBase64?: string;
}

export interface AdminUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: string;
  isAuthorized: boolean;
}

export const CATEGORY_LABELS: Record<ComplaintCategory, { label: string; icon: string; description: string }> = {
  facilities: {
    label: 'Kemudahan Bersama',
    icon: 'Building2',
    description: 'Lif, gimnasium, kolam renang, dewan serbaguna, taman permainan',
  },
  cleanliness: {
    label: 'Kebersihan',
    icon: 'Sparkles',
    description: 'Sampah, koridor kotor, bau busuk, tong sampah penuh',
  },
  security: {
    label: 'Keselamatan',
    icon: 'ShieldAlert',
    description: 'Pengawal, pintu pagar keselamatan, kad akses, CCTV, pencerobohan',
  },
  parking: {
    label: 'Tempat Letak Kereta',
    icon: 'Car',
    description: 'Halangan laluan, kereta tanpa pelekat, pencerobohan petak khas',
  },
  maintenance: {
    label: 'Penyelenggaraan & Kerosakan',
    icon: 'Wrench',
    description: 'Kebocoran paip, bekalan elektrik/air, lampu koridor rosak, bumbung tiris',
  },
  other: {
    label: 'Lain-lain',
    icon: 'HelpCircle',
    description: 'Gangguan bunyi bising, haiwan peliharaan, aduan umum lain',
  },
};

export const STATUS_CONFIG: Record<ComplaintStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  'Baru': {
    label: 'Baru Diterima',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  'Dalam Tindakan': {
    label: 'Dalam Tindakan',
    bg: 'bg-amber-50',
    text: 'text-amber-800',
    border: 'border-amber-200',
    dot: 'bg-amber-500',
  },
  'Menunggu Maklumat': {
    label: 'Menunggu Maklumat',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    dot: 'bg-purple-500',
  },
  'Selesai': {
    label: 'Selesai',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
  },
};

export const PRIORITY_CONFIG: Record<ComplaintPriority, { label: string; bg: string; text: string; badge: string }> = {
  'Kecemasan': {
    label: 'Kecemasan',
    bg: 'bg-red-500',
    text: 'text-red-700',
    badge: 'bg-red-100 text-red-800 border-red-300',
  },
  'Tinggi': {
    label: 'Tinggi',
    bg: 'bg-orange-500',
    text: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  'Sederhana': {
    label: 'Sederhana',
    bg: 'bg-amber-500',
    text: 'text-amber-700',
    badge: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  'Rendah': {
    label: 'Rendah',
    bg: 'bg-slate-400',
    text: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
  },
};

export const RESIDENTIAL_BLOCKS = [
  'Blok A',
  'Blok B',
  'Blok C',
  'Blok D',
  'Blok E',
  'Kawasan Luar / Rumah Kelab',
];

export const ASSIGNED_TEAMS = [
  'Unit Keselamatan & Kawalan Pintu',
  'Juruteknik Elektrik & Mekanikal (M&E)',
  'Pasukan Jurupaip & Sanitari',
  'Kontraktor Pembersihan & Landskap',
  'Juruteknik Penyelenggaraan Lif',
  'Pejabat Pengurusan Bangunan (JMB/MC)',
  'Penyelia Operasi Lapangan',
];

// Explicitly authorized admin emails
export const AUTHORIZED_ADMIN_EMAILS = [
  'abdulmunifahmad@gmail.com',
  'admin@spak.my',
  'pengurusan@kondominium.my',
];
