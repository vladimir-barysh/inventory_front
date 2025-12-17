// src/pages/employees/makeData.ts
import { Role, Position, Subdivision } from 'models/common';
import { Employee } from 'models/employee.model';
import { initConfig, POSITION_COLOR_PRESET, DEPARTMENT_COLOR_PRESET, ROLE_COLOR_PRESET } from 'ui/employee.config';
 
export const API_BASE = "http://localhost:8000";

// Получение списков данных
const fetchList = async <T>(endpoint: string): Promise<T[]> => {
  const res = await fetch(`${API_BASE}/${endpoint}/`);
  if (!res.ok) throw new Error(`Ошибка загрузки ${endpoint}: ${res.status}`);
  return res.json();
};
export const getRoles = () => fetchList<Role>('roles');
export const getPositions = () => fetchList<Position>('positions');
export const getSubdivisions = () => fetchList<Subdivision>('subdivisions');
export const getEmployees = () => fetchList<Employee>('employees');

// Получение справочников
export const initPositionConfig = (positions: Position[]) => (positionConfig = initConfig(positions, POSITION_COLOR_PRESET));
export const initDepartmentConfig = (subdivisions: Subdivision[]) => (departmentConfig = initConfig(subdivisions, DEPARTMENT_COLOR_PRESET));
export const initRoleConfig = (roles: Role[]) => (roleConfig = initConfig(roles, ROLE_COLOR_PRESET));

export let positionConfig: Record<string, { label: string; color: string; bgColor: string }> = {};
export let departmentConfig: Record<string, { label: string; color: string; bgColor: string }> = {};
export let roleConfig: Record<string, { label: string; color: string; bgColor: string }> = {};