import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user,  setUser]  = useState(null);
  const [role,  setRole]  = useState('member');

  useEffect(() => {
    const t = localStorage.getItem('ttm_token');
    const u = localStorage.getItem('ttm_user');
    const r = localStorage.getItem('ttm_role');
    if (t) setToken(t);
    if (u) { try { setUser(JSON.parse(u)); } catch {} }
    if (r) setRole(r);
  }, []);

  /** Call after successful login / signup.
   *  Expects { token, user, role } from the API response.
   */
  function login({ token, user, role }) {
    const resolvedRole = user?.role || role || 'member';
    setToken(token);
    setUser(user || null);
    setRole(resolvedRole);
    localStorage.setItem('ttm_token', token);
    if (user) localStorage.setItem('ttm_user', JSON.stringify(user));
    localStorage.setItem('ttm_role', resolvedRole);
  }

  function logout() {
    setToken(null); setUser(null); setRole('member');
    localStorage.removeItem('ttm_token');
    localStorage.removeItem('ttm_user');
    localStorage.removeItem('ttm_role');
  }

  return (
    <AuthContext.Provider value={{ token, user, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
