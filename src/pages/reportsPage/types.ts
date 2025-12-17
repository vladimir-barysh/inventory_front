// src/pages/reportsPage/types.ts
// Интерфейс одного показателя
export interface Indicator {
  name: string;      // Наименование показателя
  value: number | string;  // Значение
  unit: string;      // Единица измерения
  formula: string;   // Формула или способ расчета
}

export interface CategoryStock {
  categoryName: string;
  totalQuantity: number;
  totalValue: number; // сумма * цена
}


export interface Document {
  id: number;
  number: string;
  date: string; 
  comment?: string;
  company_id?: number;
  document_type_id: number;
}

export interface DocumentLine {
  id: number;
  quantity: number;
  actual_quantity?: number;
  product_id: number;
  document_id: number;
  storage_zone_sender_id: number;
  storage_zone_receiver_id: number;
}

export interface Product {
  id: number;
  article: number;
  name: string;
  purchase_price?: number; 
  sell_price?: number;
  is_active: boolean;
  category_id: number;
  unit_id: number;
}

export interface StorageZone {
  id: number;
  name: string;
  comment?: string; 
  storage_condition_id: number;
}

export interface StorageCondition {
  id: number;
  name: string;
}

export interface DocumentType {
  id: number;
  name: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Unit {
  id: number;
  name: string;
}
