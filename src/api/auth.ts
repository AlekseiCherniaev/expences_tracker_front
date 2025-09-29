import { api } from './client';

export async function requestVerifyEmail(): Promise<string> {
  const res = await api.post<string>('/request-verify-email');
  return res.data;
}

export async function verifyEmail(email_token: string): Promise<string> {
  const res = await api.put<string>('/verify-email', null, {
    params: { email_token },
  });
  return res.data;
}

export async function requestResetPassword(email: string): Promise<string> {
  const res = await api.post<string>('/request-reset-password', { email });
  return res.data;
}

export async function resetPassword(
  password_token: string,
  new_password: string
): Promise<string> {
  const res = await api.put<string>(
    '/reset-password',
    { new_password },
    { params: { password_token } }
  );
  return res.data;
}
