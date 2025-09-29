import axios, { AxiosInstance } from 'axios';

const API_URL = '/api';

let accessToken: string | null = null;
let isRefreshing = false;
let refreshSubscribers: ((token: string | null) => void)[] = [];

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

function subscribeTokenRefresh(cb: (token: string | null) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string | null) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest.url.includes('/auth/refresh')
    ) {
      (originalRequest as any)._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers['Authorization'] = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const data = await refreshToken();
        onRefreshed(data.access_token);
        originalRequest.headers['Authorization'] =
          `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (e) {
        setAccessToken(null);
        onRefreshed(null);
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export async function register(
  username: string,
  email: string,
  password: string
) {
  const res = await api.post('/auth/register', { username, email, password });
  setAccessToken(res.data.access_token);
  return res.data;
}

export async function login(username: string, password: string) {
  const res = await api.post('/auth/login', { username, password });
  setAccessToken(res.data.access_token);
  return res.data;
}

export async function refreshToken() {
  const csrfToken = getCookie('csrf_token');
  if (!csrfToken) throw new Error('Missing CSRF token');

  const res = await axios.post(
    API_URL + '/auth/refresh',
    {},
    {
      withCredentials: true,
      headers: { 'X-CSRF-Token': csrfToken },
    }
  );

  setAccessToken(res.data.access_token);
  return res.data;
}

export async function logout() {
  const csrfToken = getCookie('csrf_token');
  if (!csrfToken) throw new Error('Missing CSRF token');

  await api.post(
    '/auth/logout',
    {},
    { headers: { 'X-CSRF-Token': csrfToken } }
  );
  setAccessToken(null);
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}
