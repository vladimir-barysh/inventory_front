import apiClient from '../../api/axios';

export type ProductFormData = Omit<Product, 'id'>;

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
  article: string;
  name: string;
  purchase_price: number;
  sell_price: number;
  is_active: number;
  category_id: number;
  unit_id: number;
}

export interface ProductCreate {
  article: string;
  name: string;
  purchase_price: number;
  sell_price: number;
  is_active: number;
  category_id: number;
  unit_id: number;
}

export interface ProductUpdate {
  article: string;
  name: string;
  purchase_price: number;
  sell_price: number;
  is_active: number;
  category_id: number;
  unit_id: number;
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
    const response = await apiClient.post('/products/', product);
    return response.data;
  },

  update: async (id: number, product: ProductUpdate): Promise<Product> => {
    const response = await apiClient.put(`/products/${id}`, product);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/products/${id}`);
  },

  getQuantity: async (id: number, zone?: number): Promise<number> => {
    const response = await apiClient.get(`/products/${id}/quantity`);
    return response.data.total_quantity;  
  },
};