import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

import {
  api
} from '../utils/api';

const AuthContext =
  createContext(null);

export function AuthProvider({
  children
}) {
  const [
    user,
    setUser
  ] = useState(null);

  const [
    loading,
    setLoading
  ] = useState(true);

  useEffect(() => {
    async function restoreSession() {
      try {
        const token =
          localStorage.getItem(
            'wishlink_token'
          );

        /*
         * If there is no saved token, we can still
         * try /auth/me because the browser may have
         * a valid HTTP-only cookie.
         */
        const response =
          await api.get(
            '/auth/me'
          );

        setUser(
          response.data.user
        );
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    restoreSession();
  }, []);

  async function login(
    email,
    password
  ) {
    const response =
      await api.post(
        '/auth/login',
        {
          email,
          password
        }
      );

    /*
     * Save the returned token so authentication
     * survives refreshes even when cross-origin
     * cookies are unreliable.
     */
    if (response.data.token) {
      localStorage.setItem(
        'wishlink_token',
        response.data.token
      );
    }

    setUser(
      response.data.user
    );

    return response.data.user;
  }

  async function logout() {
    try {
      await api.post(
        '/auth/logout'
      );
    } finally {
      localStorage.removeItem(
        'wishlink_token'
      );

      setUser(null);
    }
  }

  const value =
    useMemo(
      () => ({
        user,
        loading,
        login,
        logout
      }),
      [
        user,
        loading
      ]
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(
    AuthContext
  );
}