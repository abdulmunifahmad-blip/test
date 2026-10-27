import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  onSnapshot,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { Complaint, ComplaintFormData, ComplaintStatus, StatusHistoryEntry } from '../types';

export function generateReferenceNumber(): string {
  const year = new Date().getFullYear();
  // 5 digits random number
  const randomNum = Math.floor(10000 + Math.random() * 90000);
  return `ADU-${year}-${randomNum}`;
}

export function compressImageFile(file: File, maxWidth = 1200, quality = 0.7): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('Sila muat naik fail imej sahaja (JPEG, PNG, WebP).'));
      return;
    }

    // Limit original file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('Saiz fail imej melebihi had maksimum 10MB.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Gagal memproses gambar pada pelayar web.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        // Convert to webp/jpeg data url
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };
      img.onerror = () => reject(new Error('Gagal membaca fail gambar yang dipilih.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Ralat semasa memproses fail gambar.'));
    reader.readAsDataURL(file);
  });
}

export async function submitComplaint(formData: ComplaintFormData): Promise<Complaint> {
  // Client-side thorough validation
  if (!formData.fullName.trim()) throw new Error('Nama penuh pengadu adalah wajib diisi.');
  if (!formData.phoneNumber.trim()) throw new Error('Nombor telefon adalah wajib diisi.');
  if (!formData.block.trim()) throw new Error('Sila pilih blok kediaman anda.');
  if (!formData.unitNumber.trim()) throw new Error('Nombor unit kediaman adalah wajib diisi.');
  if (!formData.category) throw new Error('Sila pilih kategori aduan.');
  if (!formData.title.trim()) throw new Error('Tajuk aduan adalah wajib diisi.');
  if (!formData.description.trim()) throw new Error('Keterangan terperinci mengenai aduan adalah wajib diisi.');

  const referenceNumber = generateReferenceNumber();
  const now = new Date();
  
  // Format submission date in Malay
  const formattedDate = new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const initialHistory: StatusHistoryEntry[] = [
    {
      timestamp: formattedDate,
      previousStatus: 'Permulaan',
      newStatus: 'Baru',
      updatedBy: 'Sistem Portal Penduduk',
      notes: 'Aduan diterima secara rasmi melalui Portal Awam SPAK.',
    },
  ];

  const complaintData: Complaint = {
    referenceNumber,
    fullName: formData.fullName.trim(),
    phoneNumber: formData.phoneNumber.trim(),
    block: formData.block.trim(),
    unitNumber: formData.unitNumber.trim(),
    category: formData.category,
    title: formData.title.trim(),
    description: formData.description.trim(),
    photoUrl: formData.photoBase64 || '',
    submissionDate: formattedDate,
    status: 'Baru',
    priority: 'Sederhana',
    assignedTo: 'Belum Ditugaskan',
    adminNotes: '',
    actionTaken: '',
    history: initialHistory,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  const path = `complaints/${referenceNumber}`;
  try {
    const docRef = doc(db, 'complaints', referenceNumber);
    await setDoc(docRef, complaintData);
    return { ...complaintData, id: referenceNumber };
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeToComplaints(
  onUpdate: (complaints: Complaint[]) => void,
  onError: (error: Error) => void
): () => void {
  const complaintsRef = collection(db, 'complaints');
  
  const unsubscribe = onSnapshot(
    complaintsRef,
    (snapshot) => {
      const complaints: Complaint[] = [];
      snapshot.forEach((docSnapshot) => {
        complaints.push({
          ...(docSnapshot.data() as Complaint),
          id: docSnapshot.id,
        });
      });
      // Sort in-memory by createdAt descending
      complaints.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      onUpdate(complaints);
    },
    (error) => {
      onError(error);
      handleFirestoreError(error, OperationType.LIST, 'complaints');
    }
  );

  return unsubscribe;
}

export async function updateComplaintDetails(
  id: string,
  updates: Partial<Complaint>,
  currentComplaint: Complaint,
  adminName: string
): Promise<void> {
  const path = `complaints/${id}`;
  const now = new Date();
  const formattedTimestamp = new Intl.DateTimeFormat('ms-MY', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(now);

  const newHistory = [...(currentComplaint.history || [])];

  // If status changed or action taken updated, append to history
  if (updates.status && updates.status !== currentComplaint.status) {
    newHistory.unshift({
      timestamp: formattedTimestamp,
      previousStatus: currentComplaint.status,
      newStatus: updates.status,
      updatedBy: adminName,
      notes: updates.adminNotes ? `Kemas kini status: ${updates.adminNotes}` : `Status ditukar kepada ${updates.status}`,
    });
  } else if (updates.actionTaken && updates.actionTaken !== currentComplaint.actionTaken) {
    newHistory.unshift({
      timestamp: formattedTimestamp,
      previousStatus: currentComplaint.status,
      newStatus: currentComplaint.status,
      updatedBy: adminName,
      notes: `Tindakan dikemas kini: ${updates.actionTaken.substring(0, 100)}...`,
    });
  }

  const payload: Partial<Complaint> = {
    ...updates,
    history: newHistory.slice(0, 50),
    updatedAt: now.toISOString(),
  };

  try {
    const docRef = doc(db, 'complaints', id);
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteComplaintById(id: string): Promise<void> {
  const path = `complaints/${id}`;
  try {
    const docRef = doc(db, 'complaints', id);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Sample Malaysian Apartment Complaints Seed Data
export async function seedSampleComplaintsIfEmpty(): Promise<boolean> {
  try {
    const snapshot = await getDocs(collection(db, 'complaints'));
    if (!snapshot.empty) {
      return false; // Already populated
    }

    const sampleComplaints: Complaint[] = [
      {
        referenceNumber: 'ADU-2026-10492',
        fullName: 'Ahmad Faiz bin Zulkifli',
        phoneNumber: '012-3849102',
        block: 'Blok B',
        unitNumber: 'B-14-08',
        category: 'facilities',
        title: 'Lif Nombor 2 Mengalami Bunyi Luar Biasa & Pintu Tersekat',
        description: 'Lif penumpang nombor 2 di Blok B sering tersekat di antara aras 10 dan 14. Terdapat bunyi geseran besi yang kuat. Memerlukan pemeriksaan juruteknik segera untuk keselamatan penghuni.',
        photoUrl: '',
        submissionDate: '26 Okt 2026, 09:30 pagi',
        status: 'Dalam Tindakan',
        priority: 'Kecemasan',
        assignedTo: 'Juruteknik Penyelenggaraan Lif',
        adminNotes: 'Pihak pembekal lif Schindler telah dihubungi dan juruteknik dijadualkan tiba jam 2 petang hari ini.',
        actionTaken: 'Lif ditutup sementara untuk penyelenggaraan keselamatan kecemasan.',
        history: [
          {
            timestamp: '26 Okt 2026, 11:15 pagi',
            previousStatus: 'Baru',
            newStatus: 'Dalam Tindakan',
            updatedBy: 'Pengurus Bangunan (JMB)',
            notes: 'Panggilan kecemasan kepada kontraktor lif berdaftar dibuat.',
          },
          {
            timestamp: '26 Okt 2026, 09:30 pagi',
            previousStatus: 'Permulaan',
            newStatus: 'Baru',
            updatedBy: 'Sistem Portal Penduduk',
            notes: 'Aduan diterima secara rasmi melalui Portal Awam SPAK.',
          },
        ],
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 40000000).toISOString(),
      },
      {
        referenceNumber: 'ADU-2026-21845',
        fullName: 'Tan Wei Ming',
        phoneNumber: '016-8921473',
        block: 'Blok A',
        unitNumber: 'A-05-12',
        category: 'cleanliness',
        title: 'Sampah Pukal & Kotak Terbiar di Hadapan Rumah Sampah Aras 5',
        description: 'Terdapat timbunan kotak perabot dan sisa binaan yang ditinggalkan oleh penghuni berdekatan chute sampah aras 5. Menimbulkan bau hapak dan menghalang laluan koridor kecemasan.',
        photoUrl: '',
        submissionDate: '27 Okt 2026, 08:15 pagi',
        status: 'Baru',
        priority: 'Tinggi',
        assignedTo: 'Kontraktor Pembersihan & Landskap',
        adminNotes: 'Perlu semak rakaman CCTV aras 5 untuk kenal pasti unit yang membuang sampah pukal.',
        actionTaken: '',
        history: [
          {
            timestamp: '27 Okt 2026, 08:15 pagi',
            previousStatus: 'Permulaan',
            newStatus: 'Baru',
            updatedBy: 'Sistem Portal Penduduk',
            notes: 'Aduan diterima secara rasmi melalui Portal Awam SPAK.',
          },
        ],
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        updatedAt: new Date(Date.now() - 14400000).toISOString(),
      },
      {
        referenceNumber: 'ADU-2026-33921',
        fullName: 'Siti Nurhaliza binti Kamaruddin',
        phoneNumber: '019-4501928',
        block: 'Blok C',
        unitNumber: 'C-02-03',
        category: 'parking',
        title: 'Kenderaan Pelawat Menghalang Petak Parkir Khas Penduduk',
        description: 'Kereta sedan Proton X50 nombor pendaftaran VDX 4920 meletak kenderaan di petak parkir no. 142 milik unit saya sejak malam tadi tanpa kebenaran dan tiada sebarang nota perhubungan.',
        photoUrl: '',
        submissionDate: '25 Okt 2026, 11:45 malam',
        status: 'Selesai',
        priority: 'Sederhana',
        assignedTo: 'Unit Keselamatan & Kawalan Pintu',
        adminNotes: 'Pengawal telah menyepit tayar (clamp) kenderaan terbabit.',
        actionTaken: 'Pemilik kenderaan (pelawat unit C-08-01) telah membayar denda buka kunci RM50 dan mengalihkan kenderaan ke kawasan parkir pelawat.',
        history: [
          {
            timestamp: '26 Okt 2026, 08:30 pagi',
            previousStatus: 'Dalam Tindakan',
            newStatus: 'Selesai',
            updatedBy: 'Penyelia Keselamatan',
            notes: 'Denda telah diselesaikan dan tempat letak kereta dikosongkan.',
          },
          {
            timestamp: '26 Okt 2026, 12:10 pagi',
            previousStatus: 'Baru',
            newStatus: 'Dalam Tindakan',
            updatedBy: 'Pengawal Pos Utama',
            notes: 'Tindakan clamp tayar diambil pada jam 12:10 tengah malam.',
          },
        ],
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 80000000).toISOString(),
      },
      {
        referenceNumber: 'ADU-2026-44289',
        fullName: 'Kavitha a/p Subramaniam',
        phoneNumber: '017-6629184',
        block: 'Blok D',
        unitNumber: 'D-08-11',
        category: 'maintenance',
        title: 'Kebocoran Paip Utama Air di Siling Koridor Berhampiran Lif',
        description: 'Air paip menitis dengan laju dari siling plaster koridor aras 8 berhampiran pintu lif Blok D. Lantai jubin menjadi sangat licin dan berbahaya kepada warga emas serta kanak-kanak.',
        photoUrl: '',
        submissionDate: '27 Okt 2026, 10:00 pagi',
        status: 'Dalam Tindakan',
        priority: 'Tinggi',
        assignedTo: 'Pasukan Jurupaip & Sanitari',
        adminNotes: 'Punca kebocoran datang dari sambungan paip retak aras 9.',
        actionTaken: 'Injap paip utama zon telah ditutup sementara dan penggantian paip PVC sedang dijalankan.',
        history: [
          {
            timestamp: '27 Okt 2026, 10:45 pagi',
            previousStatus: 'Baru',
            newStatus: 'Dalam Tindakan',
            updatedBy: 'Juruteknik Penyelenggaraan',
            notes: 'Pemeriksaan lapangan selesai, kerja kimpalan dan gam paip sedang dibuat.',
          },
          {
            timestamp: '27 Okt 2026, 10:00 pagi',
            previousStatus: 'Permulaan',
            newStatus: 'Baru',
            updatedBy: 'Sistem Portal Penduduk',
            notes: 'Aduan diterima secara rasmi melalui Portal Awam SPAK.',
          },
        ],
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        referenceNumber: 'ADU-2026-55910',
        fullName: 'Mohd Ridzuan bin Othman',
        phoneNumber: '013-3392817',
        block: 'Blok A',
        unitNumber: 'A-18-02',
        category: 'security',
        title: 'Palang Pintu Masuk Automatik (Boom Gate) Tidak Mengesan Kad Akses RFID',
        description: 'Laluan masuk kiri Blok A gagal mengesan pelekat RFID kereta penduduk sejak pagi semalam. Menyebabkan kesesakan kenderaan panjang di waktu puncak jam 7.00 pagi.',
        photoUrl: '',
        submissionDate: '24 Okt 2026, 07:45 pagi',
        status: 'Menunggu Maklumat',
        priority: 'Sederhana',
        assignedTo: 'Unit Keselamatan & Kawalan Pintu',
        adminNotes: 'Memerlukan jurutera sistem pembekal magnetik gate datang menguji sensor gelombang.',
        actionTaken: 'Pengawal bertugas membuka palang secara manual bagi melancarkan trafik waktu puncak.',
        history: [
          {
            timestamp: '25 Okt 2026, 02:00 petang',
            previousStatus: 'Dalam Tindakan',
            newStatus: 'Menunggu Maklumat',
            updatedBy: 'Pengurus Bangunan',
            notes: 'Menunggu maklum balas sebut harga alat ganti reader daripada pembekal.',
          },
        ],
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
      },
      {
        referenceNumber: 'ADU-2026-67123',
        fullName: 'Lee Chong Seng',
        phoneNumber: '014-7718902',
        block: 'Kawasan Luar / Rumah Kelab',
        unitNumber: 'Clubhouse-G01',
        category: 'facilities',
        title: 'Pam Penapis Kolam Renang Kanak-Kanak Tidak Berfungsi & Air Keruh',
        description: 'Kawasan kolam renang kanak-kanak kelihatan berlumut dan air sedikit keruh. Pam sirkulasi utama dipercayai terhenti beroperasi sejak kelmarin.',
        photoUrl: '',
        submissionDate: '23 Okt 2026, 04:30 petang',
        status: 'Selesai',
        priority: 'Sederhana',
        assignedTo: 'Pasukan Jurupaip & Sanitari',
        adminNotes: 'Klorin dan bahan kimia penstabil air telah dimasukkan selepas pembersihan pump strainer.',
        actionTaken: 'Filter strainer dibersihkan daripada dedaun dan pam telah dihidupkan semula dengan bacaan pH stabil 7.4.',
        history: [
          {
            timestamp: '24 Okt 2026, 11:00 pagi',
            previousStatus: 'Dalam Tindakan',
            newStatus: 'Selesai',
            updatedBy: 'Penyelia Kolam & Landskap',
            notes: 'Pemeriksaan kualiti air kolam lulus standard keselamatan.',
          },
        ],
        createdAt: new Date(Date.now() - 345600000).toISOString(),
        updatedAt: new Date(Date.now() - 259200000).toISOString(),
      },
    ];

    for (const item of sampleComplaints) {
      await setDoc(doc(db, 'complaints', item.referenceNumber), item);
    }
    return true;
  } catch (error) {
    console.warn('Gagal memasukkan data contoh:', error);
    return false;
  }
}
