import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestResetPassword } from '../api/auth';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await requestResetPassword(email);
      navigate('/check-email', { state: { email } });
    } catch (err: any) {
      const errorDetail = err?.response?.data?.detail?.toLowerCase() || '';
      if (errorDetail.includes('not found')) {
        setError('Почта не найдена');
      } else if (errorDetail.includes('user does not have an verified email')) {
        setError('Для сброса пароля необходимо подтвердить email');
      } else {
        setError('Ошибка при отправке письма. Попробуйте еще раз.');
      }
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Сброс пароля</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleRequest} className="space-y-4">
        <input
          type="email"
          placeholder="Введите ваш email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Отправить письмо для сброса
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        <a href="/login" className="text-blue-500 hover:underline">
          Вернуться к входу
        </a>
      </p>
    </div>
  );
}
