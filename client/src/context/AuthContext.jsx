import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  signInWithPopup,
  signOut as firebaseSignOut,
} from 'firebase/auth';

import { api } from '../utils/api';
import {
  auth,
  googleProvider,
  prepareFirebaseAuth,
} from '../firebase';

const AuthContext = createContext(null);

function setStoredToken(token) {
  if (!token) return;

  localStorage.setItem('wishlink_token', token);
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
}

function clearStoredToken() {
  localStorage.removeItem('wishlink_token');
  delete api.defaults.headers.common.Authorization;
}

function restoreStoredToken() {
  const token = localStorage.getItem('wishlink_token');

  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  return token;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        restoreStoredToken();

        const response = await api.get('/auth/me');
        setUser(response.data.user);
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function loginWithGoogle() {
    await prepareFirebaseAuth();

    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    const response = await api.post('/auth/google', {
      idToken,
    });

    if (response.data.token) {
      setStoredToken(response.data.token);
    }

    setUser(response.data.user);

    return response.data.user;
  }

  async function logout() {
    try {
      await api.post('/auth/logout');
    } catch {
      // okay if backend session is already gone
    } finally {
      clearStoredToken();

      try {
        await firebaseSignOut(auth);
      } catch {
        // okay if firebase session is already cleared
      }

      setUser(null);
    }
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      loginWithGoogle,
      logout,
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}