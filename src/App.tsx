import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { Navbar } from './components/Navbar';
import { PublicComplaintForm } from './components/PublicComplaintForm';
import { PublicStatusCheck } from './components/PublicStatusCheck';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { PrintableReceipt } from './components/PrintableReceipt';
import { PrintableReport } from './components/PrintableReport';
import { subscribeToAuthState, logOutAdmin } from './services/authService';
import { testConnection } from './firebase';
import { Complaint } from './types';
import { Building2, Shield, HeartHandshake, PhoneCall } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'form' | 'status' | 'admin' | 'print-report' | 'print-slip'>('form');
  const [adminUser, setAdminUser] = useState<User | null>(null);
  const [isAdminAuthorized, setIsAdminAuthorized] = useState<boolean>(false);
  const [statusCheckRef, setStatusCheckRef] = useState<string>('');
  
  // For printing views
  const [printComplaint, setPrintComplaint] = useState<Complaint | null>(null);
  const [reportComplaints, setReportComplaints] = useState<Complaint[]>([]);
  const [reportFilterInfo, setReportFilterInfo] = useState<string>('');

  // Subscribe to Firebase Auth state
  useEffect(() => {
    testConnection();
    const unsubscribe = subscribeToAuthState((user, isAuthorized) => {
      setAdminUser(user);
      setIsAdminAuthorized(isAuthorized);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await logOutAdmin();
    setCurrentTab('form');
  };

  const handleGoToStatusCheck = (refNumber: string) => {
    setStatusCheckRef(refNumber);
    setCurrentTab('status');
  };

  const handlePrintSlip = (complaint: Complaint) => {
    setPrintComplaint(complaint);
    setCurrentTab('print-slip');
  };

  const handleOpenPrintReport = (complaintsList: Complaint[], filterInfo: string) => {
    setReportComplaints(complaintsList);
    setReportFilterInfo(filterInfo);
    setCurrentTab('print-report');
  };

  // Render printable slip view
  if (currentTab === 'print-slip' && printComplaint) {
    return (
      <PrintableReceipt
        complaint={printComplaint}
        onBack={() => setCurrentTab('form')}
      />
    );
  }

  // Render printable full report view
  if (currentTab === 'print-report') {
    return (
      <PrintableReport
        complaints={reportComplaints}
        filterInfo={reportFilterInfo}
        onBack={() => setCurrentTab('admin')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navigation Header */}
      <Navbar
        currentTab={currentTab as 'form' | 'status' | 'admin'}
        onSelectTab={(tab) => setCurrentTab(tab)}
        adminUser={adminUser}
        isAdminAuthorized={isAdminAuthorized}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {currentTab === 'form' && (
          <PublicComplaintForm
            onSuccessComplaint={(c) => {
              // Can optionally show toast or let internal view render receipt
            }}
            onGoToStatusCheck={handleGoToStatusCheck}
            onPrintSlip={handlePrintSlip}
          />
        )}

        {currentTab === 'status' && (
          <PublicStatusCheck
            initialRefNumber={statusCheckRef}
            onPrintSlip={handlePrintSlip}
          />
        )}

        {currentTab === 'admin' && (
          <>
            {adminUser && isAdminAuthorized ? (
              <AdminDashboard
                adminEmail={adminUser.email}
                adminName={adminUser.displayName || adminUser.email || 'Pentadbir'}
                onOpenPrintReport={handleOpenPrintReport}
                onOpenPrintSlip={handlePrintSlip}
              />
            ) : (
              <AdminLogin onLoginSuccess={() => setCurrentTab('admin')} />
            )}
          </>
        )}
      </main>

      {/* Official Malaysian Resident Community Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-sm mb-2">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <span>Kondominium Seri Mutiara</span>
              </div>
              <p className="text-slate-400 leading-relaxed text-[11px]">
                Sistem Pengurusan Aduan Kediaman (SPAK) dikendalikan secara rasmi oleh Badan Pengurusan Bersama (JMB) bagi memastikan keselamatan, keselesaan, dan kemudahan komuniti terpelihara.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2 text-xs">Hubungan Pejabat Pengurusan</h4>
              <p className="text-[11px] leading-relaxed">
                Tingkat G, Rumah Kelab Kondominium Seri Mutiara,<br />
                Jalan Seri Mutiara 1, 47100 Puchong, Selangor.<br />
                Waktu Operasi: Isnin &ndash; Jumaat (8.30 pagi &ndash; 5.30 petang)<br />
                Sabtu: (8.30 pagi &ndash; 1.00 tengah hari)
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2 text-xs">Talian Kecemasan 24 Jam</h4>
              <p className="text-[11px] leading-relaxed">
                Pos Pengawal Keselamatan Utama: <span className="text-emerald-400 font-bold">03-8070 1238</span><br />
                Bilik Kawalan Juruteknik M&E: <span className="text-emerald-400 font-bold">03-8070 1239</span><br />
                Emel Aduan: <span className="text-slate-300">pengurusan@kondominium.my</span>
              </p>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <p>
              &copy; {new Date().getFullYear()} Badan Pengurusan Bersama (JMB) Kondominium Seri Mutiara. Hak Cipta Terpelihara.
            </p>
            <div className="flex items-center gap-4 text-slate-500">
              <span>Akta Pengurusan Strata 2013 (Akta 757)</span>
              <span>&bull;</span>
              <span>Privasi Terpelihara</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
