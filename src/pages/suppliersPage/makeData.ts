const API_BASE = "http://localhost:8000";

export interface CompanyType {
  id: number;
  name: string;
}

export interface Company {
  id: number;
  name: string;
  company_type_id: number;
  company_type: string | null;
}

// Получение типов компаний
export const getCompanyTypes = async (): Promise<CompanyType[]> => {
  const res = await fetch(`${API_BASE}/companytypes/`);
  if (!res.ok) throw new Error("Ошибка загрузки типов компаний");
  return res.json();
};

// Получение списка компаний
export const getCompanies = async (): Promise<Company[]> => {
  const res = await fetch(`${API_BASE}/companies/`);
  if (!res.ok) throw new Error("Ошибка загрузки компаний");
  return res.json();
};

// Создание новой компании
export const postCompany = async (data: { name: string; company_type_id: number }) => {
  const res = await fetch(`${API_BASE}/companies/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка создания компании");
  return res.json();
};

// Обновление компании
export const putCompany = async (id: number, data: { name: string; company_type_id: number }) => {
  const res = await fetch(`${API_BASE}/companies/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Ошибка обновления компании");
  return res.json();
};

// Удаление компании
export const deleteCompanyById = async (id: number) => {
  const res = await fetch(`${API_BASE}/companies/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Ошибка удаления компании");
  return res.json();
};
