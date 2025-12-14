import {useEffect, useState} from 'react';
import apiClient from '../../api/axios';
import { CircularProgress, Typography } from '@mui/material';


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

export interface Product {
  id: number;
  article: number;
  name: string;
  purchase_price: number;
  sell_price: number;
  is_active: number;
  category_id: number;
  unit_id: number;
}
export type ProductFormData = Omit<Product, 'id'>;

export interface ProductCreate {
  article: number;
  name: string;
  purchase_price: number;
  sell_price: number;
  is_active: number;
  category_id: number;
  unit_id: number;
}

export interface ProductUpdate {
  article: number;
  name: string;
  purchase_price: number;
  sell_price: number;
  is_active: number;
  category_id: number;
  unit_id: number;
}

export interface Unit {
  id: number;
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

export const productApi ={
  getAll: async (): Promise<Product[]> => {
    const response = await apiClient.get('/products/');
    return response.data;
  },

  // Получить по ID
  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (product: ProductCreate): Promise<Product> => {
    const response = await apiClient.post('/products/create', product);
    return response.data;
  },

  update: async (id: number, product: ProductUpdate): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}/update`, product);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}/delete`);
  },

  getQuantity: async (id: number, zone?: number): Promise<number> => {
    const response = await apiClient.get(`/products/${id}/quantity`);
    return response.data;  
  },

  getFullQuantity: async (id: number): Promise<number> => {
    const response = await apiClient.get(`/products/${id}/fullquantity`);
    return response.data.quantity;
  },
};

export const unitApi = {
  getAll: async (): Promise<Unit[]> => {
    const response = await apiClient.get(`/units/`);
    return response.data;
  }
};

interface ProductQuantityProps {
  productId: number;
}

export const ProductQuantity: React.FC<ProductQuantityProps> = ({ productId }) => {
  // 2. Исправляем тип useState - указываем что может быть number или string
  const [quantity, setQuantity] = useState<number | string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuantity = async () => {
      try {
        setLoading(true);
        console.log('🔄 Начало загрузки для productId:', productId);
         // Получаем объект {quantity: число}
        const qty = await productApi.getFullQuantity(productId);
        
        console.log('Извлеченное количество:', qty);
        setQuantity(qty);
        console.log('📦 Ответ API:', qty);
      } catch (error) {
        console.error('Error fetching quantity:', error);
        setQuantity('N/A');
      } finally {
        setLoading(false);
      }
    };

    fetchQuantity();
  }, [productId]);

  if (loading) {
    return <>Загрузка</>;
  }
  console.log('✅ Показываем quantity:', quantity);
  return <>{quantity}</>;
};

export default ProductQuantity;