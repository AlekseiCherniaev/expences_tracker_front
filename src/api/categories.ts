import { api } from './client';

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  is_default: boolean;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CategoryCreateRequest {
  name: string;
  description?: string | null;
  is_default?: boolean;
  color: string;
}

export interface CategoryUpdateRequest {
  id: string;
  name?: string | null;
  description?: string | null;
  is_default?: boolean | null;
  color?: string | null;
}

export async function getCategory(category_id: string): Promise<Category> {
  const res = await api.get<Category>(`/categories/get/${category_id}`);
  return res.data;
}

export async function getCategoriesByUser(): Promise<Category[]> {
  const res = await api.get<Category[]>('/categories/get-by-user');
  return res.data;
}

export async function createCategory(
  data: CategoryCreateRequest
): Promise<Category> {
  const res = await api.post<Category>('/categories/create', data);
  return res.data;
}

export async function updateCategory(
  data: CategoryUpdateRequest
): Promise<Category> {
  const res = await api.put<Category>('/categories/update', data);
  return res.data;
}

export async function deleteCategory(category_id: string): Promise<void> {
  await api.delete(`/categories/delete/${category_id}`);
}
