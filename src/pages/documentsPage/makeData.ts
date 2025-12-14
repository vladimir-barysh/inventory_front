import apiClient from '../../api/axios';

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
}

// Типы для создания/обновления документа
export interface DocumentCreate {
  number: string;
  date: string;
  comment?: string; 
  company_id?: number;
  document_type_id: number;
}

export interface DocumentUpdate {
  number?: string;
  date?: string;
  comment?: string;
  company_id?: number;
  document_type_id?: number;
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






// Базовый интерфейс для строки документа
interface BaseDocumentLine {
  id: number;
  documentId: number;
  товарId: number;
  артикул: string;
  наименование: string;
  единицаИзмерения: string;
  количество: number;
}

// Интерфейс для строки приходной накладной
export interface ПриходнаяСтрока extends BaseDocumentLine {
  тип: 'приходная';
  категория: string;
  ценаЗакупки: number;
  ценаПродажи: number;
  сумма: number; // ценаЗакупки * количество
  зонаХранения: string;
}

// Интерфейс для строки расходной накладной
export interface РасходнаяСтрока extends BaseDocumentLine {
  тип: 'расходная';
  ценаПродажи: number;
  сумма: number; // ценаПродажи * количество
  зонаХранения: string;
}

// Интерфейс для строки инвентаризации
export interface ИнвентаризацияСтрока extends BaseDocumentLine {
  тип: 'инвентаризация';
  фактическоеКоличество: number;
  цена: number; // цена продажи
  суммаПоУчету: number; // цена * количество
  суммаФактическая: number; // цена * фактическоеКоличество
}

// Интерфейс для строки перемещения
export interface ПеремещениеСтрока extends BaseDocumentLine {
  тип: 'перемещение';
  зонаХраненияОткуда: string;
  зонаХраненияКуда: string;
}

// Интерфейс для строки списания
export interface СписаниеСтрока extends BaseDocumentLine {
  тип: 'списание';
  цена: number; // цена закупки
  сумма: number; // цена * количество
  количествоСписания: number;
  суммаСписания: number; // цена * количествоСписания
  зонаХранения: string;
}

// Объединенный тип для строк документа
export type DocumentLine = 
  | ПриходнаяСтрока 
  | РасходнаяСтрока 
  | ИнвентаризацияСтрока 
  | ПеремещениеСтрока 
  | СписаниеСтрока;

// Интерфейс для товара
/* export interface Document {
  id: number;
  артикул: string;
  наименование: string;
  категория: string;
  ценаЗакупки: number;
  ценаПродажи: number;
  единицаИзмерения: string;
  остаток: number;
  зонаХранения?: string;
} */


// Зоны хранения для выпадающих списков
export const storageZones = [
  'A-1', 'A-2', 'A-3', 'A-4',
  'B-1', 'B-2', 'B-3', 'B-4',
  'C-1', 'C-2', 'C-3', 'C-4',
  'Холодильная камера 1', 'Холодильная камера 2',
  'Секция 1', 'Секция 2', 'Секция 3'
];