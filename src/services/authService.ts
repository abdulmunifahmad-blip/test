import {
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { AUTHORIZED_ADMIN_EMAILS } from '../types';

export async function isEmailAuthorizedAdmin(email: string | null): Promise<boolean> {
  if (!email) return false;
  const normalizedEmail = email.toLowerCase().trim();

  // Check hardcoded whitelist
  const inWhitelist = AUTHORIZED_ADMIN_EMAILS.some(
    (e) => e.toLowerCase().trim() === normalizedEmail
  );
  if (inWhitelist) return true;

  // Check Firestore 'admins' collection by email or uid
  try {
    const adminDocRef = doc(db, 'admins', normalizedEmail);
    const snap = await getDoc(adminDocRef);
    if (snap.exists()) return true;
  } catch (err) {
    // If not readable or doesn't exist, rely on primary whitelist
  }

  return false;
}

export async function signInAdminWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    const isAuthorized = await isEmailAuthorizedAdmin(user.email);

    if (!isAuthorized) {
      // Immediately sign out to prevent unauthorized access
      await firebaseSignOut(auth);
      throw new Error(
        `Akses Ditolak: Emel (${user.email || 'Tanpa Emel'}) tidak tersenarai sebagai pentadbir sah berdaftar untuk Komuniti Kediaman ini. Sila hubungi pihak pengurusan bangunan.`
      );
    }

    return user;
  } catch (error: any) {
    if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Tetingkap log masuk Google telah ditutup sebelum selesai.');
    }
    if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Permintaan log masuk telah dibatalkan.');
    }
    throw error;
  }
}

export async function logOutAdmin(): Promise<void> {
  await firebaseSignOut(auth);
}

export function subscribeToAuthState(
  callback: (user: User | null, isAuthorized: boolean) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      callback(null, false);
      return;
    }
    const isAuthorized = await isEmailAuthorizedAdmin(user.email);
    callback(user, isAuthorized);
  });
}
