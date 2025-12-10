import axios from 'axios';
import { API_BASE_URL, API_CONFIG_DEFAULT } from './config';

// Создаем экземпляр axios с настройками
// Вариант 1: Более чистый подход - убираем дублирование
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ИЛИ Вариант 2: С использованием spread operator, но без дублирования
// const apiClient = axios.create({
//   ...API_CONFIG_DEFAULT,
//   baseURL: API_BASE_URL, // Заменяем baseURL из API_CONFIG_DEFAULT
// });

// Интерцептор для добавления токена авторизации
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Интерцептор для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Если 401 ошибка, очищаем токен и редиректим на логин
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;