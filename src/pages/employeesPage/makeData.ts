import apiClient from '../../api/axios';
// src/pages/employees/makeData.ts
export const API_BASE = "http://localhost:8000";

// Роли
export interface Role {
  id: number;
  name: string;
}
// Должности
export interface Position {
  id: number;
  name: string;
}
// Подразделения
export interface Subdivision {
  id: number;
  name: string;
}

// Сотрудники
export interface Employee {
  id: number;
  login: string;
  password: string;
  фамилия: string;
  имя: string;
  email: string;
  телефон: string;
  серияПаспорта: string;
  номерПаспорта: string;
  датаРождения: string;
  роль: string;
  должность: string;
  подразделение: string;
}

export interface EmployeeUpdate {
  login: string;
  password: string;
  фамилия: string;
  имя: string;
  email: string;
  телефон: string;
  серияПаспорта: number;
  номерПаспорта: number;
  датаРождения: string;
  роль: number;
  должность: number;
  подразделение: number;
}

// Типы для формы
export interface EmployeeFormData {
  login: string;
  password: string;
  фамилия: string;
  имя: string;
  email: string;
  телефон: string;
  серияПаспорта: string;
  номерПаспорта: string;
  датаРождения: string;
  роль: string;
  должность: string;
  подразделение: string;
}

// API 
export interface EmployeeApi {
  id: number;
  login: string;
  password: string;
  first_name: string;
  last_name: string;
  passport_series: number;
  passport_number: number;
  email: string;
  number_phone: string;
  date_birth: string;
  role_id: number;
  position_id: number;
  subdivision_id: number;
}
export const buildIdNameMap = <T extends { id: number; name: string }>(array: T[]) => {
  const map: Record<number, string> = {};
  array.forEach(item => {
    map[item.id] = item.name;
  });
  return map;
};

// Преобразование сотрудников
export const mapEmployees = (
  employees: EmployeeApi[],
  roles: Role[],
  positions: Position[],
  subdivisions: Subdivision[]
): Employee[] => {
  const roleMap = buildIdNameMap(roles);
  const positionMap = buildIdNameMap(positions);
  const subdivisionMap = buildIdNameMap(subdivisions);

  return employees.map(e => ({
    id: e.id,
    login: e.login,
    password: e.password,
    фамилия: e.last_name,
    имя: e.first_name,
    email: e.email,
    телефон: e.number_phone,
    серияПаспорта: String(e.passport_series),
    номерПаспорта: String(e.passport_number),
    датаРождения: e.date_birth,
    роль: roleMap[e.role_id] ?? 'Не указано',
    должность: positionMap[e.position_id] ?? 'Не указано',
    подразделение: subdivisionMap[e.subdivision_id] ?? 'Не указано',
  }));
};

export const getRoles = async (): Promise<Role[]> => {
  const res = await fetch(`${API_BASE}/roles/`);
  if (!res.ok) {
    throw new Error(`Ошибка загрузки ролей: ${res.status}`);
  }
  return res.json();
};

export const getPositions = async (): Promise<Position[]> => {
  const res = await fetch(`${API_BASE}/positions/`);
  if (!res.ok) {
    throw new Error(`Ошибка загрузки должностей: ${res.status}`);
  }
  return res.json();
};

export const getSubdivisions = async (): Promise<Subdivision[]> => {
  const res = await fetch(`${API_BASE}/subdivisions/`);
  if (!res.ok) {
    throw new Error(`Ошибка загрузки подразделений: ${res.status}`);
  }
  return res.json();
};

export const getEmployees = async (): Promise<Employee[]> => {
  const res = await fetch(`${API_BASE}/employees/`);
  if (!res.ok) {
    throw new Error(`Ошибка загрузки сотрудников: ${res.status}`);
  }

  const data = await res.json();

  return data.map((e: any): Employee => ({
    id: e.id,
    login: e.login,
    password: e.password,    
    фамилия: e.lastname ?? '',
    имя: e.firstname ?? '',
    email: e.email ?? '',
    телефон: e.number_phone ?? '',
    серияПаспорта: e.passport_series ?? '',
    номерПаспорта: e.passport_number ?? '',
    датаРождения: e.date_birth ?? '',
    роль: e.role?.name ?? 'Не указано',
    должность: e.position?.name ?? 'Не указано',
    подразделение: e.subdivision?.name ?? 'Не указано',
  }));
};

export const loadEmployeesData = async (): Promise<Employee[]> => {
  const [roles, positions, subdivisions, employees] = await Promise.all([
    getRoles(),
    getPositions(),
    getSubdivisions(),
    fetch(`${API_BASE}/employees/`).then(r => r.json()),
  ]);

  const roleMap = buildIdNameMap(roles);
  const positionMap = buildIdNameMap(positions);
  const subdivisionMap = buildIdNameMap(subdivisions);

  return employees.map((e: EmployeeApi): Employee => ({
    id: e.id,
    login: e.login,
    password: e.password,
    фамилия: e.last_name,
    имя: e.first_name,
    email: e.email,
    телефон: e.number_phone,
    серияПаспорта: String(e.passport_series),
    номерПаспорта: String(e.passport_number),
    датаРождения: e.date_birth,
    роль: roleMap[e.role_id] ?? 'Не указано',
    должность: positionMap[e.position_id] ?? 'Не указано',
    подразделение: subdivisionMap[e.subdivision_id] ?? 'Не указано',
  }));
};


const POSITION_COLOR_PRESET = [
  { color: '#d32f2f', bgColor: '#ffebee' },
  { color: '#1976d2', bgColor: '#e3f2fd' },
  { color: '#388e3c', bgColor: '#e8f5e9' },
  { color: '#f57c00', bgColor: '#fff3e0' },
  { color: '#7b1fa2', bgColor: '#f3e5f5' },
];

const DEPARTMENT_COLOR_PRESET = [
  { color: '#00796b', bgColor: '#e0f2f1' },
  { color: '#0288d1', bgColor: '#e1f5fe' },
  { color: '#f57c00', bgColor: '#fff3e0' },
  { color: '#c2185b', bgColor: '#fce4ec' },
  { color: '#512da8', bgColor: '#ede7f6' },
];
const ROLE_COLOR_PRESET = [
  { color: '#7b1fa2', bgColor: '#f3e5f5' },
  { color: '#1976d2', bgColor: '#e3f2fd' },
];


export let positionConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
}> = {};

export let departmentConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
}> = {};
export let roleConfig: Record<string, {
  label: string;
  color: string;
  bgColor: string;
}> = {};


export const initPositionConfig = (positions: Position[]) => {
  positionConfig = {};

  positions.forEach((p, index) => {
    const preset = POSITION_COLOR_PRESET[index % POSITION_COLOR_PRESET.length];

    positionConfig[p.name] = {
      label: p.name,
      color: preset.color,
      bgColor: preset.bgColor,
    };
  });

  console.log('Position config initialized:', positionConfig);
};

export const initDepartmentConfig = (subdivisions: Subdivision[]) => {
  departmentConfig = {};

  subdivisions.forEach((d, index) => {
    const preset = DEPARTMENT_COLOR_PRESET[index % DEPARTMENT_COLOR_PRESET.length];

    departmentConfig[d.name] = {
      label: d.name,
      color: preset.color,
      bgColor: preset.bgColor,
    };
  });
};

export const initRoleConfig = (roles: Role[]) => {
  roleConfig = {};

  roles.forEach((r, index) => {
    const preset = ROLE_COLOR_PRESET[index % ROLE_COLOR_PRESET.length];

    roleConfig[r.name] = {
      label: r.name,
      color: preset.color,
      bgColor: preset.bgColor,
    };
  });
};

// API
export const buildNameIdMap = <T extends { id: number; name: string }>(array: T[]) => {
  const map: Record<string, number> = {};
  array.forEach(item => {
    map[item.name] = item.id;
  });
  return map;
};


export const postEmployee = async (
  data: EmployeeFormData,
  roles: Role[],
  positions: Position[],
  subdivisions: Subdivision[]) => {
  try{
    const roleMap = buildNameIdMap(roles);
    const positionMap = buildNameIdMap(positions);
    const subdivisionMap = buildNameIdMap(subdivisions);

    const roleId = roleMap[data.роль];
    const positionId = positionMap[data.должность];
    const subdivisionId = subdivisionMap[data.подразделение];

    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    const [day, month, year] = data.датаРождения.split('.');
    const date_birth = `${year}-${month}-${day}`;

    const body = {
      login: `${data.имя}.${data.фамилия}`.toLowerCase(),
      password: `${data.фамилия}.${randomNumber}`.toLowerCase(),
      first_name: data.имя.trim(),
      last_name: data.фамилия.trim(),
      email: data.email.trim(),
      number_phone: data.телефон.trim(),
      passport_series: Number(data.серияПаспорта.trim()),
      passport_number: Number(data.номерПаспорта.trim()),
      date_birth: date_birth,
      role_id: roleId,
      position_id: positionId,
      subdivision_id: subdivisionId,
    };


    const res = await fetch(`${API_BASE}/employees/create`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ошибка создания сотрудника (${res.status}): ${errorText}`);
    }
    return res.json();

  } catch (error) {
    console.error("Ошибка в postEmployee:", error);
    throw error;
  }
}

export const updateEmployee = async (
  employeeId: number,
  data: EmployeeFormData,
  roles: Role[],
  positions: Position[],
  subdivisions: Subdivision[]
) => {
  try {
    console.log('=== UPDATE EMPLOYEE START ===');
    console.log('Employee ID:', employeeId);
    console.log('Form data:', data);
    
    // Создаем мапы для поиска ID по именам
    const roleMap = buildNameIdMap(roles);
    const positionMap = buildNameIdMap(positions);
    const subdivisionMap = buildNameIdMap(subdivisions);
    
    // Получаем ID по именам
    const roleId = roleMap[data.роль];
    const positionId = positionMap[data.должность];
    const subdivisionId = subdivisionMap[data.подразделение];
    
    console.log('Found IDs:', { roleId, positionId, subdivisionId });
    
    // Проверяем что все ID найдены
    if (!roleId || !positionId || !subdivisionId) {
      throw new Error(`Не найдены ID для: 
        ${!roleId ? 'роль' : ''} 
        ${!positionId ? 'должность' : ''} 
        ${!subdivisionId ? 'подразделение' : ''}`);
    }
    
    // Преобразуем дату рождения
    let date_birth = '';
    if (data.датаРождения) {
      if (data.датаРождения.includes('.')) {
        const [day, month, year] = data.датаРождения.split('.');
        date_birth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      } else {
        date_birth = data.датаРождения; // если уже в формате yyyy-mm-dd
      }
    }
    
    // Подготавливаем тело запроса
    const body: any = {
      first_name: data.имя?.trim() || '',
      last_name: data.фамилия?.trim() || '',
      email: data.email?.trim() || '',
      number_phone: data.телефон?.trim() || '',
      passport_series: Number(data.серияПаспорта?.trim()) || 0,
      passport_number: Number(data.номерПаспорта?.trim()) || 0,
      date_birth: date_birth,
      role_id: roleId,
      position_id: positionId,
      subdivision_id: subdivisionId,
    };
    
    // Добавляем логин/пароль только если они переданы
    if (data.login) body.login = data.login.trim();
    if (data.password) body.password = data.password.trim();
    
    console.log('Request body:', body);
    
    const url = new URL(`${API_BASE}/employees/${employeeId}/update`);
    url.searchParams.append('employee_id', employeeId.toString());
    
    const res = await fetch(url.toString(), {
      method: "PUT", // или "PATCH" в зависимости от сервера
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(body),
    });
    
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Server error:', errorText);
      throw new Error(`Ошибка обновления сотрудника (${res.status}): ${errorText}`);
    }
    
    const result = await res.json();
    console.log('Update successful:', result);
    console.log('=== UPDATE EMPLOYEE END ===');
    
    return result;
    
  } catch (error) {
    console.error("Ошибка в updateEmployee:", error);
    throw error;
  }
};

export const deleteEmployee = async (employeeId: number) => {
  try {
    // Проверьте правильный endpoint в Swagger!
    const url = `${API_BASE}/employees/${employeeId}/delete`; // или другой endpoint
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }
    
    // Если сервер возвращает данные
    if (response.status !== 204) { // 204 No Content
      return await response.json();
    }
    
    return { success: true, message: 'Employee deleted' };
    
  } catch (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export const employeeApi = {
  update: async (id: number, data: EmployeeFormData) => {
    // Получаем актуальные списки
    const [roles, positions, subdivisions] = await Promise.all([
      getRoles(),
      getPositions(),
      getSubdivisions()
    ]);
    
    return await updateEmployee(id, data, roles, positions, subdivisions);
  },

  delete: async (id: number) => {
    return await deleteEmployee(id);
  },
  
  // ... другие методы
};