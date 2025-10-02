import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { setAccessToken, refreshToken } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        console.log('🔍 Starting OAuth callback...');
        
        const accessTokenFromUrl = searchParams.get('access_token');
        const success = searchParams.get('success');
        
        if (success === 'true' && accessTokenFromUrl) {
          console.log('🔍 Found access token in URL');
          setAccessToken(accessTokenFromUrl);
          await refreshUser();
          setStatus('success');
          setTimeout(() => navigate('/'), 1000);
          return;
        }
        
        try {
          console.log('🔍 Attempting token refresh...');
          await refreshToken();
          console.log('🔍 Token refreshed successfully');
          await refreshUser();
          setStatus('success');
          setTimeout(() => navigate('/'), 1000);
          return;
        } catch (refreshError) {
          console.log('🔍 Token refresh failed:', refreshError);
        }
        
        const getCookie = (name: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          console.log(`🔍 Cookie ${name}:`, match ? 'found' : 'not found');
          return match ? decodeURIComponent(match[2]) : null;
        };
        
        const accessTokenFromCookie = getCookie('access_token');
        console.log('🔍 Access token from cookie:', accessTokenFromCookie);
        
        if (accessTokenFromCookie) {
          setAccessToken(accessTokenFromCookie);
          await refreshUser();
          setStatus('success');
          setTimeout(() => navigate('/'), 1000);
        } else {
          throw new Error('No access token found in any source');
        }
      } catch (err) {
        console.error('🔍 OAuth callback error:', err);
        setError('Не удалось получить токен авторизации');
        setStatus('error');
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    handleOAuthCallback();
  }, [navigate, refreshUser, searchParams]);

  if (status === 'error') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
        <div className="text-red-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2 text-red-600">Ошибка</h1>
        <p className="mb-4 text-gray-600">{error}</p>
        <p className="text-sm text-gray-500 mb-4">
          Автоматический переход через 3 секунды...
        </p>
        <button
          onClick={() => navigate('/login')}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Вернуться к входу
        </button>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
        <div className="text-green-500 mb-4">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold mb-2 text-green-600">Успешно!</h1>
        <p className="mb-4 text-gray-600">Авторизация прошла успешно</p>
        <p className="text-sm text-gray-500">
          Перенаправление на главную страницу...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h1 className="text-xl font-bold mb-4">Завершение входа...</h1>
      <div className="flex justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
      <p className="text-sm text-gray-600">
        Пожалуйста, подождите
      </p>
    </div>
  );
}