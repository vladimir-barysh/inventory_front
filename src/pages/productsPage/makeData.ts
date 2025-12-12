import apiClient from '../../api/axios';
import { useState, useEffect, useCallback } from 'react';
export interface Product {
  id: number;
  артикул: string;
  наименование: string;
  категория: string;
  подкатегория: string;
  ценаЗакупки: number;
  ценаПродажи: number;
  поставщик: string; // ID поставщика
  количество: number;
  единицаИзмерения: 'шт' | 'кг' | 'л' | 'м' | 'упак' | 'компл';
}

export type ProductFormData = Omit<Product, 'id'>;

// Данные поставщиков
export const suppliers = [
  { id: '1', наименование: 'ООО "ТехноМир"' },
  { id: '2', наименование: 'ИП Петров А.В.' },
  { id: '3', наименование: 'АО "ОфисСнаб"' },
  { id: '4', наименование: 'ЗАО "МебельПрофи"' },
  { id: '5', наименование: 'ООО "Канцелярский рай"' },
];

// Данные товаров
export const productsData: Product[] = [
  {
    id: 1,
    артикул: 'SM-001',
    наименование: 'Смартфон Samsung Galaxy S23',
    категория: 'Электроника',
    подкатегория: 'Смартфоны',
    ценаЗакупки: 65000,
    ценаПродажи: 79990,
    поставщик: '1',
    количество: 15,
    единицаИзмерения: 'шт',
  },
  {
    id: 2,
    артикул: 'LP-001',
    наименование: 'Ноутбук Lenovo IdeaPad',
    категория: 'Электроника',
    подкатегория: 'Ноутбуки',
    ценаЗакупки: 45000,
    ценаПродажи: 54990,
    поставщик: '1',
    количество: 8,
    единицаИзмерения: 'шт',
  },
  {
    id: 3,
    артикул: 'PR-001',
    наименование: 'Лазерный принтер HP',
    категория: 'Офисная техника',
    подкатегория: 'Принтеры',
    ценаЗакупки: 12000,
    ценаПродажи: 15990,
    поставщик: '3',
    количество: 0,
    единицаИзмерения: 'шт',
  },
];



// ========== ТИПЫ ==========
export interface Category {
  id: number;
  name: string;
}

export interface CategoryCreate {
  name: string;
}

export interface CategoryUpdate {
  name: string;
}

// ========== API ФУНКЦИИ ==========
export const categoryApi = {
  // Получить все категории
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories/');
    return response.data;
  },

  // Получить категорию по ID
  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Создать новую категорию
  create: async (category: CategoryCreate): Promise<Category> => {
    const response = await apiClient.post('/categories/', category);
    return response.data;
  },

  // Обновить категорию
  update: async (id: number, category: CategoryUpdate): Promise<Category> => {
    const response = await apiClient.put(`/categories/${id}`, category);
    return response.data;
  },

  // Удалить категорию
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/categories/${id}`);
  },
};
