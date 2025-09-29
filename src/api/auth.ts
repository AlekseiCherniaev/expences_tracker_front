import { api } from './client';

export async function requestVerifyEmail(): Promise<void> {
  await api.post('/auth/request-verify-email');
}

export async function verifyEmail(email_token: string): Promise<void> {
  await api.put('/auth/verify-email', null, {
    params: { email_token },
  });
}

export async function requestResetPassword(email: string): Promise<void> {
  await api.post('/auth/request-reset-password', { email });
}

export async function resetPassword(
  password_token: string,
  new_password: string
): Promise<void> {
  await api.put(
    '/auth/reset-password',
    { new_password },
    { params: { password_token } }
  );
}
