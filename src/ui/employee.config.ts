// src/ui/employee.config.ts  
// Преобразование даты
export const normalizeDate = (dateStr: string | null): string | null => {
  if (!dateStr) return null;
  if (dateStr.includes('.')) {
    const [day, month, year] = dateStr.split('.');
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }
  return dateStr;
};

// Цвета для полей 
export const POSITION_COLOR_PRESET = [
  { color: '#d32f2f', bgColor: '#ffebee' },
  { color: '#1976d2', bgColor: '#e3f2fd' },
  { color: '#388e3c', bgColor: '#e8f5e9' },
  { color: '#f57c00', bgColor: '#fff3e0' },
  { color: '#7b1fa2', bgColor: '#f3e5f5' },
];
export const DEPARTMENT_COLOR_PRESET = [
  { color: '#00796b', bgColor: '#e0f2f1' },
  { color: '#0288d1', bgColor: '#e1f5fe' },
  { color: '#f57c00', bgColor: '#fff3e0' },
  { color: '#c2185b', bgColor: '#fce4ec' },
  { color: '#512da8', bgColor: '#ede7f6' },
];
export const ROLE_COLOR_PRESET = [
  { color: '#7b1fa2', bgColor: '#f3e5f5' },
  { color: '#1976d2', bgColor: '#e3f2fd' },
];

export const initConfig = <T extends { name: string }>(
  array: T[],
  presets: { color: string; bgColor: string }[]
) => {
  const config: Record<string, { label: string; color: string; bgColor: string }> = {};
  array.forEach((item, index) => {
    const preset = presets[index % presets.length];
    config[item.name] = { label: item.name, color: preset.color, bgColor: preset.bgColor };
  });
  return config;
};