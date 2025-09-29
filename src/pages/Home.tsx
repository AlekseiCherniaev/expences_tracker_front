import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateCurrentUser,
  uploadAvatarFile,
  deleteAvatar,
  deleteCurrentUser,
} from "../api/users";

export default function Home() {
  const { user, logoutUser, refreshUser } = useAuth();

  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!user) {
    return <p className="text-center mt-10 text-gray-600">Загрузка...</p>;
  }

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateCurrentUser({
        email: email || null,
        password: password || null,
      });
      setMessage("Профиль обновлён ✅");
      setPassword("");
      await refreshUser();
    } catch {
      setMessage("Ошибка при обновлении профиля ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setLoading(true);
      await uploadAvatarFile(file);
      setMessage("Аватар обновлён ✅");
      await refreshUser();
    } catch {
      setMessage("Ошибка при загрузке аватара ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setLoading(true);
      await deleteAvatar();
      setMessage("Аватар удалён ✅");
      await refreshUser();
    } catch {
      setMessage("Ошибка при удалении аватара ❌");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteCurrentUser();
      logoutUser();
    } catch {
      setMessage("Ошибка при удалении аккаунта ❌");
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-lg shadow space-y-6">
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
          <strong>Email подтверждён:</strong>{" "}
          {user.email_verified ? "✅" : "❌"}
        </p>
        <p>
          <strong>Создан:</strong>{" "}
          {new Date(user.created_at).toLocaleString()}
        </p>
        <p>
          <strong>Обновлён:</strong>{" "}
          {new Date(user.updated_at).toLocaleString()}
        </p>
      </div>

      <div className="mt-4 flex flex-col items-center gap-3">
        {user.avatar_url ? (
          <img
            src={user.avatar_url}
            alt="Avatar"
            className="w-24 h-24 rounded-full border"
          />
        ) : (
          <div className="w-24 h-24 rounded-full border flex items-center justify-center text-gray-400">
            Нет аватара
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarUpload}
          className="mt-2"
        />
        {user.avatar_url && (
          <button
            onClick={handleAvatarDelete}
            className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
          >
            Удалить аватар
          </button>
        )}
      </div>

      <div className="space-y-3">
        <input
          type="email"
          placeholder="Новый email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <input
          type="password"
          placeholder="Новый пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleUpdate}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Сохраняю..." : "Обновить профиль"}
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={logoutUser}
          className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
        >
          Выйти
        </button>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
        >
          Удалить аккаунт
        </button>
      </div>

      {message && (
        <p className="mt-2 text-center text-sm text-gray-700">{message}</p>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Подтверждение</h2>
            <p className="mb-4">Ты точно хочешь удалить аккаунт? 🚨</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
              >
                Отмена
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 disabled:opacity-50"
              >
                {loading ? "Удаляю..." : "Удалить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
