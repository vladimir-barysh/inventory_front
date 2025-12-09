import React, { createContext, useContext, useState, useEffect } from 'react';
import apiClient from 'C:/Users/megab/Рабочий стол/inventory/inventory_front/src/api/axios';

interface User {
  id: string;
  username: string;
  name: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string, remember: boolean) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненную сессию при загрузке
    const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (savedToken) {
      validateToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await apiClient.get('/auth/validate', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data) {
        setUser(response.data);
        setToken(token);
      } else {
        clearAuth();
      }
    } catch (error) {
      console.error('Ошибка валидации токена:', error);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const login = async (login: string, password: string, remember: boolean) => {
    try {
      const response = await apiClient.post('/auth/login', {
        login,
        password
      });

      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      setToken(authToken);
      
      // Сохраняем токен
      if (remember) {
        localStorage.setItem('token', authToken);
      } else {
        sessionStorage.setItem('token', authToken);
      }
      
      // Сохраняем токен в axios для последующих запросов
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;

    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Ошибка авторизации';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    clearAuth();
    // Опционально: вызывать API для выхода на сервере
    // apiClient.post('/api/logout');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};