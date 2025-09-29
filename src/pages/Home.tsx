import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user, logoutUser } = useAuth();

  if (!user) {
    return <p className="text-center mt-10 text-gray-600">Загрузка...</p>;
  }

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Профиль</h1>

      <div className="space-y-2">
        <p>
          <strong>ID:</strong> {user.id}
        </p>
        <p>
          <strong>Имя пользователя:</strong> {user.username}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>Email подтверждён:</strong>{' '}
          {user.email_verified ? '✅' : '❌'}
        </p>
        <p>
          <strong>Создан:</strong> {new Date(user.created_at).toLocaleString()}
        </p>
        <p>
          <strong>Обновлён:</strong>{' '}
          {new Date(user.updated_at).toLocaleString()}
        </p>
      </div>

      {user.avatar_url && (
        <div className="mt-4">
          <img
            src={user.avatar_url}
            alt="Avatar"
            className="w-24 h-24 rounded-full border"
          />
        </div>
      )}

      <button
        onClick={logoutUser}
        className="mt-6 w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
      >
        Выйти
      </button>
    </div>
  );
}
