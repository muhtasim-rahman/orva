import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  EmailAuthProvider,
  linkWithCredential,
  fetchSignInMethodsForEmail,
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]           = useState(undefined); // undefined = loading
  const [isAdmin, setIsAdmin]     = useState(false);
  const [pinPassed, setPinPassed] = useState(
    // Persists for the browser tab session
    () => sessionStorage.getItem('orva_pin_ok') === '1'
  );

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check if this UID is in admin whitelist
        try {
          if (!db) { setIsAdmin(false); return; }
          const snap = await get(ref(db, `settings/admin/allowedUids/${u.uid}`));
          setIsAdmin(snap.exists() && snap.val() === true);
        } catch {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    });
    return unsub;
  }, []);

  function markPinPassed() {
    sessionStorage.setItem('orva_pin_ok', '1');
    setPinPassed(true);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result   = await signInWithPopup(auth, provider);
    return result.user;
  }

  async function loginWithEmail(email, password) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  async function logout() {
    sessionStorage.removeItem('orva_pin_ok');
    setPinPassed(false);
    setIsAdmin(false);
    await signOut(auth);
  }

  const value = {
    user,
    isAdmin,
    pinPassed,
    loading: user === undefined,
    markPinPassed,
    loginWithGoogle,
    loginWithEmail,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
