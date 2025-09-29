import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestVerifyEmail } from '../api/auth';

export default function VerifyEmail() {
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRequest = async () => {
    setError(null);
    try {
      await requestVerifyEmail();
      navigate('/check-email', { state: { email: 'ваш адрес' } });
    } catch (err: any) {
      setError(
        err?.response?.data?.detail || 'Ошибка при запросе подтверждения'
      );
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h1 className="text-xl font-bold mb-4">Подтверждение email</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <p className="mb-4">
        Нажмите кнопку ниже, чтобы запросить письмо для подтверждения email.
      </p>
      <button
        onClick={handleRequest}
        className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
      >
        Отправить письмо
      </button>

      <p className="mt-4 text-sm">
        <a href="/login" className="text-blue-500 hover:underline">
          Вернуться к входу
        </a>
      </p>
    </div>
  );
}
