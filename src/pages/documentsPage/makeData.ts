import apiClient from '../../api/axios';
import {Product, StorageZone} from '../../pages';

// ========== ТИПЫ ==========
export interface DocumentType {
  id: number;
  name: string;
}

export interface Document {
  id: number;
  number: string;
  date: string;
  comment: string;
  company_id: number; 
  document_type_id: number; 
  zone_id: number;
  employee_id: number;
}

// Типы для создания/обновления документа
export interface DocumentCreate {
  number: string;
  date: string;
  comment?: string; 
  company_id?: number;
  document_type_id: number;
  zone_id?: number;
  employee_id?: number;
}  

export interface DocumentUpdate {
  number?: string;
  date?: string;
  comment?: string;
  company_id?: number;
  document_type_id?: number;
}

// Типы для строк документа
export interface DocumentLine {
  id: number;
  document_id: number;
  product_id: number;
  quantity: number;
  storage_zone_sender_id: number | null;
  storage_zone_receiver_id: number | null;
}

// Создание строки документа
export interface DocumentLineCreate {
  document_id: number;
  product_id: number;
  quantity: number;
  actual_quantity?: number;
  storage_zone_sender_id?: number | null;
  storage_zone_receiver_id?: number | null;
}

// Обновление строки документа
export interface DocumentLineUpdate {
  quantity?: number;
  actual_quantity?: number;
  storage_zone_sender_id?: number | null;
  storage_zone_receiver_id?: number | null;
}

interface DocumentLinesResponse {
  document_id: number;
  lines_count: number;
  lines: DocumentLine[];
}

// ========== API ФУНКЦИИ ==========
export const documentTypeApi = {
  // Получить все типы документов
  getAll: async (): Promise<DocumentType[]> => {
    const response = await apiClient.get('/documenttypes/');
    return response.data;
  },

  // Получить тип документа по ID
  getById: async (id: number): Promise<DocumentType> => {
    const response = await apiClient.get(`/documenttypes/${id}`);
    return response.data;
  },
};

export const documentApi = {
  // Получить все документы
  getAll: async (): Promise<Document[]> => {
    const response = await apiClient.get('/documents/');
    return response.data;
  },

  // Получить документ по ID
  getById: async (id: number): Promise<Document> => {
    const response = await apiClient.get(`/documents/${id}`);
    return response.data;
  },

  // Создать новый документ
  create: async (document: DocumentCreate): Promise<Document> => {
    const response = await apiClient.post('/documents/', document);
    return response.data;
  },

  createInvDoc: async (doc: DocumentCreate): Promise<Document> => {
    const response = await apiClient.post('/documents/create_inv_doc', doc);
    return response.data;
  },

  createRecDoc: async (doc: DocumentCreate): Promise<Document> => {
    const response = await apiClient.post('/documents/create_rec_doc', doc);
    return response.data;
  },

  createTrnDoc: async (doc: DocumentCreate): Promise<Document> => {
    const response = await apiClient.post('/documents/create_trn_doc', doc);
    return response.data;
  },

  createWrfDoc: async (doc: DocumentCreate): Promise<Document> => {
    const response = await apiClient.post('/documents/create_wrf_doc', doc);
    return response.data;
  },

  // Обновить документ
  update: async (id: number, document: DocumentUpdate): Promise<Document> => {
    const response = await apiClient.put(`/documents/${id}`, document);
    return response.data;
  },

  // Удалить документ
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/documents/${id}`);
  },
};

export const documentLineApi = {
  // Получить все строки документа
  getByDocumentId: async (documentId: number): Promise<DocumentLinesResponse> => {
    const response = await apiClient.get(`/documentlines/document/${documentId}`);
    return response.data; // Теперь это объект, а не массив
  },

  // Получить строку по ID
  getById: async (lineId: number): Promise<DocumentLine> => {
    const response = await apiClient.get(`/documentlines/${lineId}`);
    return response.data;
  },

  // Создать строку документа
  create: async (line: DocumentLineCreate): Promise<DocumentLine> => {
    const response = await apiClient.post('/documentlines/', line);
    return response.data;
  },

  // Обновить строку документа
  update: async (lineId: number, line: DocumentLineUpdate): Promise<DocumentLine> => {
    const response = await apiClient.put(`/documentlines/${lineId}`, line);
    return response.data;
  },

  // Удалить строку документа
  delete: async (lineId: number): Promise<void> => {
    await apiClient.delete(`/documentlines/${lineId}`);
  },
};