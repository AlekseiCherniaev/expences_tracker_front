import { api } from './client';

export interface User {
  id: string;
  username: string;
  email: string;
  email_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<User>('/users/me');
  return res.data;
}

export async function updateUser(data: {
  email?: string;
  password?: string;
}): Promise<User> {
  const res = await api.put<User>('/users/update', data);
  return res.data;
}

export async function uploadAvatar(
  file: File
): Promise<{ upload_url: string; public_url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await api.put<{ upload_url: string; public_url: string }>(
    '/users/upload-avatar',
    formData
  );

  return res.data;
}

export async function deleteAvatar(): Promise<string> {
  const res = await api.put<string>('/users/delete-avatar');
  return res.data;
}

export async function deleteUser(): Promise<string> {
  const res = await api.delete<string>('/users/delete');
  return res.data;
}
