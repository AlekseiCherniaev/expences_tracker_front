import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const { loginUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await loginUser(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.detail || 'Ошибка входа');
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">Вход</h1>
      {error && <p className="text-red-500 mb-2">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Войти
        </button>
      </form>

      <p className="mt-4 text-center text-sm">
        Нет аккаунта?{' '}
        <a href="/register" className="text-blue-500 hover:underline">
          Зарегистрироваться
        </a>
      </p>
      <p className="mt-2 text-center text-sm">
        <a
          href="/reset-password-request"
          className="text-blue-500 hover:underline"
        >
          Забыли пароль?
        </a>
      </p>
    </div>
  );
}
