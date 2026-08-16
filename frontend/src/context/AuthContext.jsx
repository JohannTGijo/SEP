import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    try {
      const res = await api.get('auth/me/');
      setUser(res.data);
    } catch (err) {
      logout();
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      if (accessToken) {
        try {
          await fetchCurrentUser();
        } catch (err) {
          if (refreshToken) {
            try {
              const res = await api.post('auth/refresh/', { refresh: refreshToken });
              localStorage.setItem('accessToken', res.data.access);
              if (res.data.refresh) {
                localStorage.setItem('refreshToken', res.data.refresh);
              }
              await fetchCurrentUser();
            } catch (refErr) {
              logout();
            }
          } else {
            logout();
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    const res = await api.post('auth/login/', { username, password });
    localStorage.setItem('accessToken', res.data.access);
    localStorage.setItem('refreshToken', res.data.refresh);
    await fetchCurrentUser();
  };

  const register = async (username, email, password, confirmPassword) => {
    await api.post('auth/register/', {
      username,
      email,
      password,
      confirm_password: confirmPassword,
    });
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
