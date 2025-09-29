import axios, { AxiosInstance } from 'axios';

const API_URL = '/api/auth';

let accessToken: string | null = null;

const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

function setAccessToken(token: string | null) {
  accessToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        await refreshToken();
        return api(originalRequest);
      } catch (e) {
        setAccessToken(null);
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
  const res = await api.post('/register', { username, email, password });
  setAccessToken(res.data.access_token);
  return res.data;
}

export async function login(username: string, password: string) {
  const res = await api.post('/login', { username, password });
  setAccessToken(res.data.access_token);
  return res.data;
}

export async function refreshToken() {
  const csrfToken = getCookie('csrf_token');
  if (!csrfToken) throw new Error('Missing CSRF token');

  const res = await api.post(
    '/refresh',
    {},
    { headers: { 'X-CSRF-Token': csrfToken } }
  );
  setAccessToken(res.data.access_token);
  return res.data;
}

export async function logout() {
  const csrfToken = getCookie('csrf_token');
  if (!csrfToken) throw new Error('Missing CSRF token');

  await api.post('/logout', {}, { headers: { 'X-CSRF-Token': csrfToken } });
  setAccessToken(null);
}

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[2]) : null;
}

export { api, setAccessToken };
