import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetPassword } from '../api/auth';

export default function ResetPasswordConfirm() {
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const query = new URLSearchParams(useLocation().search);
  const token = query.get('token');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Нет токена в ссылке');
      return;
    }
    try {
      await resetPassword(token, newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Ошибка при сбросе пароля');
    }
  };

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
        <h1 className="text-xl font-bold mb-4">Пароль обновлён 🎉</h1>
        <p>Сейчас вы будете перенаправлены на страницу входа...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Введите новый пароль</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}

      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="password"
          placeholder="Новый пароль"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="w-full border p-2 rounded"
          required
        />
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600"
        >
          Сбросить пароль
        </button>
      </form>
    </div>
  );
}
