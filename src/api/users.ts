import { api } from "./client";

export interface User {
  id: string;
  username: string;
  email: string | null;
  email_verified: boolean;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserUpdateRequest {
  email?: string | null;
  password?: string | null;
}

export interface UserAvatarUploadResponse {
  upload_url: string;
  public_url: string;
}

export async function getCurrentUser(): Promise<User> {
  const res = await api.get<User>("/users/me");
  return res.data;
}

export async function updateCurrentUser(
  data: UserUpdateRequest
): Promise<User> {
  const res = await api.put<User>("/users/update", data);
  return res.data;
}

export async function getAvatarUploadUrls(): Promise<UserAvatarUploadResponse> {
  const res = await api.put<UserAvatarUploadResponse>("/users/upload-avatar");
  return res.data;
}

export async function uploadAvatarFile(
  file: File
): Promise<{ public_url: string }> {
  const { upload_url, public_url } = await getAvatarUploadUrls();

  await fetch(upload_url, {
    method: "PUT",
    body: file,
    headers: {
      "Content-Type": file.type,
    },
  });

  return { public_url };
}

export async function deleteAvatar(): Promise<void> {
  await api.put("/users/delete-avatar");
}

export async function deleteCurrentUser(): Promise<void> {
  await api.delete("/users/delete");
}
