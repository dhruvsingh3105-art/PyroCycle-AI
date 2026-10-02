import React, { createContext, useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken') || null);
  const [loading, setLoading] = useState(!user && !!token);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setLoading(false);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const storedRefresh = localStorage.getItem('refreshToken');
    if (!storedRefresh) {
      logout();
      return null;
    }

    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${storedRefresh}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const newToken = data.access_token;
        localStorage.setItem('token', newToken);
        setToken(newToken);
        return newToken;
      } else {
        logout();
        return null;
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      return null;
    }
  }, [logout]);

  const fetchUser = useCallback(async (activeToken) => {
    const curToken = activeToken || token;
    if (!curToken) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${curToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } else if (response.status === 401) {
        // Access token expired, attempt refresh
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          const retryRes = await fetch(`${API_URL}/auth/me`, {
            headers: {
              'Authorization': `Bearer ${refreshedToken}`,
            },
          });
          if (retryRes.ok) {
            const data = await retryRes.json();
            setUser(data);
            localStorage.setItem('user', JSON.stringify(data));
          } else {
            logout();
          }
        }
      } else {
        logout();
      }
    } catch (error) {
      console.warn('Network issue fetching user profile, using cached session:', error);
    } finally {
      setLoading(false);
    }
  }, [token, refreshAccessToken, logout]);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchUser(token);
    } else {
      setLoading(false);
    }
  }, [token, fetchUser]);

  useEffect(() => {
    const handleAuthExpired = () => {
      logout();
    };
    window.addEventListener('auth:expired', handleAuthExpired);
    return () => window.removeEventListener('auth:expired', handleAuthExpired);
  }, [logout]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
          setRefreshToken(data.refresh_token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        setToken(data.access_token);
        return { success: true, user: data.user };
      }
      return { success: false, msg: data.msg || 'Login failed' };
    } catch (err) {
      return { success: false, msg: 'Network error during login' };
    }
  };

  const register = async (email, password, role, name) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, name }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.access_token) {
          localStorage.setItem('token', data.access_token);
          setToken(data.access_token);
        }
        if (data.refresh_token) {
          localStorage.setItem('refreshToken', data.refresh_token);
          setRefreshToken(data.refresh_token);
        }
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
        }
        return { success: true, user: data.user };
      }
      return { success: false, msg: data.msg || 'Registration failed' };
    } catch (err) {
      return { success: false, msg: 'Network error during registration' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        refreshToken,
        loading,
        login,
        register,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
