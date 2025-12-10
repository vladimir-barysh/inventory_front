// Конфигурация API
const API_CONFIG = {
  // Для разработки
  development: 'http://localhost:8000',
  // Для продакшена
  production: 'https://your-api-domain.com',
};

// Автоматическое определение среды
const isDevelopment = process.env.NODE_ENV === 'development';
export const API_BASE_URL = isDevelopment 
  ? API_CONFIG.development 
  : API_CONFIG.production;

// Общий конфиг для запросов (без baseURL)
export const API_CONFIG_DEFAULT = {
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};