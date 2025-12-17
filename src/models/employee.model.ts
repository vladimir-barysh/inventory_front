// src/models/employee.model.ts  
export interface Employee {
  id: number;
  login: string;
  password: string;

  first_name: string;
  last_name: string;

  email?: string;
  number_phone?: string;
  date_birth?: string; // yyyy-mm-dd

  passport_series: number;
  passport_number: number;

  role_id: number;
  position_id: number;
  subdivision_id: number;
}

export interface EmployeeFormData {
  login: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string | null;
  number_phone: string | null;
  date_birth: string | null;
  passport_series: string;
  passport_number: string;
  role_id: number;
  position_id: number;
  subdivision_id: number;
}