// src/api/employee.api.ts  
import { Employee, EmployeeFormData } from 'models/employee.model';
import { normalizeDate } from 'ui/employee.config';


export const API_BASE = "http://localhost:8000";

const apiRequest = async <T>(url: string, method: 'POST' | 'PUT' | 'DELETE', body?: any): Promise<T> => {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Ошибка ${method} ${url} (${res.status}): ${errorText}`);
  }

  return res.status !== 204 ? res.json() : ({} as T);
};

export const postEmployee = (data: EmployeeFormData) =>
  apiRequest<Employee>(`${API_BASE}/employees/create`, 'POST', {
    ...data,
    date_birth: normalizeDate(data.date_birth),
    passport_series: Number(data.passport_series),
    passport_number: Number(data.passport_number),
  });

export const updateEmployee = (id: number, data: EmployeeFormData) =>
  apiRequest<Employee>(`${API_BASE}/employees/${id}/update`, 'PUT', {
    ...data,
    date_birth: normalizeDate(data.date_birth),
    passport_series: Number(data.passport_series),
    passport_number: Number(data.passport_number),
  });

export const deleteEmployee = (id: number) =>
  apiRequest<void>(`${API_BASE}/employees/${id}/delete`, 'DELETE');