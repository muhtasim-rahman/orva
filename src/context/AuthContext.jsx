import { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged, signInWithPopup, signInWithEmailAndPassword,
  GoogleAuthProvider, signOut,
} from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]                   = useState(undefined);   // undefined = still loading
  const [isAdmin, setIsAdmin]             = useState(false);
  const [isAdminChecking, setChecking]    = useState(false);       // true while RTDB check runs
  const [pinPassed, setPinPassed]         = useState(
    () => sessionStorage.getItem('orva_pin_ok') === '1'
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        setChecking(true);
        try {
          if (!db) { setIsAdmin(false); return; }
          const snap = await get(ref(db, `settings/admin/allowedUids/${u.uid}`));
          setIsAdmin(snap.exists() && snap.val() === true);
        } catch {
          setIsAdmin(false);
        } finally {
          setChecking(false);
        }
      } else {
        setIsAdmin(false);
        setChecking(false);
      }
    });
    return unsub;
  }, []);

  function markPinPassed() {
    sessionStorage.setItem('orva_pin_ok', '1');
    setPinPassed(true);
  }

  async function loginWithGoogle() {
    return (await signInWithPopup(auth, new GoogleAuthProvider())).user;
  }

  async function loginWithEmail(email, password) {
    return (await signInWithEmailAndPassword(auth, email, password)).user;
  }

  async function logout() {
    sessionStorage.removeItem('orva_pin_ok');
    setPinPassed(false);
    setIsAdmin(false);
    await signOut(auth);
  }

  return (
    <AuthContext.Provider value={{
      user, isAdmin, isAdminChecking, pinPassed,
      loading: user === undefined,
      markPinPassed, loginWithGoogle, loginWithEmail, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
