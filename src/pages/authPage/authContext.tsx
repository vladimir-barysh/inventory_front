import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiClient from '../../api/axios';
import dayjs, { Dayjs } from 'dayjs';

interface User {
  id: number;
  name: string,
  login: string;        // опционально, если сервер возвращает
  password: string,
  first_name: string;   // опционально
  last_name: string;    // опционально
  passport_series: number,
  passport_number: number,
  email?: string,
  phone_number?: string,
  date_birth?: Dayjs | null,
  position_id: number,
  subdivision_id: number,
  role_id: number;      // опционально
  
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

  const validateToken = useCallback(async (tokenToValidate: string) => {
    try {
      console.log('Валидация токена...');
      
      // Вариант 1: Токен в заголовках (рекомендуется)
      const response = await apiClient.get('/auth/validate', {
        headers: { 'Authorization': `Bearer ${tokenToValidate}` }
      });
      
      console.log('Токен валиден, пользователь:', response.data);
      
      setUser(response.data);
      setToken(tokenToValidate);
      
      // Устанавливаем токен для всех будущих запросов
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${tokenToValidate}`;
      return true;
    } catch (error) {
      console.error('Ошибка валидации токена:', error);
      clearAuth();
      return false;
    }
  }, []);

  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        console.log('Проверка сохраненной авторизации...');
        
        // Ищем токен в разных хранилищах
        const savedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
        console.log('Найден токен:', !!savedToken);
        
        if (savedToken) {
          const isValid = await validateToken(savedToken);
          if (!isValid) {
            console.log('Токен невалиден, очищаем...');
            clearAuth();
          }
        } else {
          console.log('Токен не найден');
        }
      } catch (error) {
        console.error('Ошибка при проверке авторизации:', error);
        clearAuth();
      } finally {
        setLoading(false);
        console.log('Проверка завершена, loading:', false);
      }
    };

    checkStoredAuth();
  }, [validateToken]);

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    delete apiClient.defaults.headers.common['Authorization'];
  };

  const login = async (login: string, password: string, remember: boolean) => {
    try {
      const response = await apiClient.post('/auth/login', {
        login: login,
        password: password
      });

      const { user: userData, access_token } = response.data;

      if (!access_token) {
        throw new Error('Токен не получен от сервера');
      }

      if (userData) {
      console.log('Login: user.id:', userData.id);
      console.log('Login: user.login:', userData.login);
      console.log('Login: user.name:', userData.name);
      console.log('Login: user.first_name:', userData.first_name);
      console.log('Login: user.last_name:', userData.last_name);
      console.log('Login: user.role_id:', userData.role_id);
    }

      setUser(userData);
      setToken(access_token);

      
      // Сохраняем токен
      if (remember) {
        console.log('Сохраняем в localStorage');
        localStorage.setItem('token', access_token);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        console.log('Сохраняем в sessionStorage');
        sessionStorage.setItem('token', access_token);
        sessionStorage.setItem('user', JSON.stringify(userData));
      }
      
      // Сохраняем токен в axios для последующих запросов
      apiClient.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;

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