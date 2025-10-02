import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        navigate("/me")
      } catch (e) {
        setError("Ошибка авторизации");
        setStatus("error");
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    checkAuth();
  }, [navigate]);

  if (status === "error") {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
        <div className="text-red-500 mb-4">❌</div>
        <h1 className="text-xl font-bold mb-2 text-red-600">Ошибка</h1>
        <p className="mb-4 text-gray-600">{error}</p>
        <p className="text-sm text-gray-500 mb-4">
          Автоматический переход через 3 секунды...
        </p>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Вернуться к входу
        </button>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
        <div className="text-green-500 mb-4">✅</div>
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
      <p className="text-sm text-gray-600">Пожалуйста, подождите</p>
    </div>
  );
}
