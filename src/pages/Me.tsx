import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  updateCurrentUser,
  uploadAvatarFile,
  deleteAvatar,
  deleteCurrentUser,
} from '../api/users';
import { requestVerifyEmail } from '../api/auth';

function InfoItemWithIcon({
  icon,
  label,
  value,
  action,
}: {
  icon: string;
  label: string;
  value: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-gray-500 font-medium">{label}</div>
        <div className="text-sm font-semibold text-gray-900 truncate">
          {value}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export default function Me() {
  const { user, logoutUser, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isFormValid, setIsFormValid] = useState(false);
  const [emailVerificationLoading, setEmailVerificationLoading] =
    useState(false);

  useEffect(() => {
    if (user === null) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    if (user) {
      setEmail(user.email ?? '');
    }
  }, [user]);

  useEffect(() => {
    const emailChanged = email !== user?.email && email.trim() !== '';
    const passwordChanged = password.trim() !== '';
    const isValidEmail =
      email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    setIsFormValid((emailChanged || passwordChanged) && isValidEmail);
  }, [email, password, user?.email]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logoutUser();
    } catch (error) {
      setMessage('Ошибка при выходе ❌');
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await deleteCurrentUser();
      await logoutUser();
    } catch {
      setMessage('Ошибка при удалении аккаунта ❌');
      setLoading(false);
      setShowDeleteModal(false);
    }
  };

  const handleRequestEmailVerification = async () => {
    if (!user?.email) {
      setMessage('Сначала укажите email ❌');
      return;
    }

    try {
      setEmailVerificationLoading(true);
      await requestVerifyEmail();
      setMessage('Письмо с подтверждением отправлено на ваш email ✅');
    } catch (error) {
      setMessage('Ошибка при отправке письма подтверждения ❌');
    } finally {
      setEmailVerificationLoading(false);
    }
  };

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user === null) {
    return null;
  }

  const handleUpdate = async () => {
    try {
      setLoading(true);
      await updateCurrentUser({
        email: email !== user.email ? email : null,
        password: password || null,
      });
      setMessage('Профиль успешно обновлён ✅');
      setPassword('');
      await refreshUser();
    } catch {
      setMessage('Ошибка при обновлении профиля ❌');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Пожалуйста, выберите изображение ❌');
      return;
    }

    try {
      setLoading(true);
      await uploadAvatarFile(file);
      setMessage('Аватар успешно обновлён ✅');
      await refreshUser();
    } catch {
      setMessage('Ошибка при загрузке аватара ❌');
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  const handleAvatarDelete = async () => {
    try {
      setLoading(true);
      await deleteAvatar();
      setMessage('Аватар удалён ✅');
      await refreshUser();
    } catch {
      setMessage('Ошибка при удалении аватара ❌');
    } finally {
      setLoading(false);
    }
  };

  const emailVerificationAction =
    !user.email_verified && user.email ? (
      <button
        onClick={handleRequestEmailVerification}
        disabled={emailVerificationLoading}
        className="bg-green-500 text-white py-1 px-3 rounded text-xs hover:bg-green-600 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        {emailVerificationLoading ? 'Отправка...' : 'Подтвердить'}
      </button>
    ) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      {message && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div
            className={`p-4 rounded-lg border shadow-lg ${
              message.includes('❌')
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-green-50 border-green-200 text-green-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span>{message}</span>
              <button
                onClick={() => setMessage(null)}
                className="ml-4 text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <span className="text-lg">🏠</span>
          На главную
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
            <h1 className="text-3xl font-bold text-white">
              Профиль пользователя
            </h1>
            <p className="text-blue-100 mt-2">
              Управление вашей учетной записью
            </p>
          </div>

          <div className="p-6 space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-8 rounded-full shadow-lg">
                  <span className="text-2xl">👤</span>
                  <h2 className="text-xl font-bold">@{user.username}</h2>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoItemWithIcon
                  icon="📧"
                  label="Email"
                  value={user.email || 'Не указан'}
                />
                <InfoItemWithIcon
                  icon={user.email_verified ? '✅' : '❌'}
                  label="Подтверждён"
                  value={user.email_verified ? 'Да' : 'Нет'}
                  action={emailVerificationAction}
                />
                <InfoItemWithIcon
                  icon="📅"
                  label="Создан"
                  value={new Date(user.created_at).toLocaleDateString('ru-RU')}
                />
                <InfoItemWithIcon
                  icon="🔄"
                  label="Обновлён"
                  value={new Date(user.updated_at).toLocaleDateString('ru-RU')}
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Аватар
              </h2>
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-shrink-0">
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt="Avatar"
                      className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-gray-200 bg-gray-100 flex items-center justify-center text-gray-400 shadow-lg">
                      <span className="text-sm">Нет аватара</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-3 flex-1">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <label className="flex-1 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                      <div className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-2 px-4 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium">
                        📷 Загрузить аватар
                      </div>
                    </label>

                    {user.avatar_url && (
                      <button
                        onClick={handleAvatarDelete}
                        disabled={loading}
                        className="bg-amber-50 text-amber-700 border border-amber-200 py-2 px-4 rounded-lg hover:bg-amber-100 transition-colors font-medium disabled:opacity-50"
                      >
                        🗑️ Удалить аватар
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    Поддерживаются форматы: JPG, PNG, GIF. Максимальный размер:
                    5MB
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Обновить профиль
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новый email
                  </label>
                  <input
                    type="email"
                    placeholder={user.email || 'Введите email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Новый пароль
                  </label>
                  <input
                    type="password"
                    placeholder="Введите новый пароль"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <button
                  onClick={handleUpdate}
                  disabled={loading || !isFormValid}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Сохраняю...
                    </span>
                  ) : (
                    '💾 Обновить профиль'
                  )}
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Действия
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="bg-gray-100 text-gray-700 border border-gray-300 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  🚪 Выйти
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-red-50 text-red-700 border border-red-200 py-3 px-4 rounded-lg font-medium hover:bg-red-100 transition-colors focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                >
                  🗑️ Удалить аккаунт
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 rounded-full mx-auto mb-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>

              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">
                Удаление аккаунта
              </h2>

              <p className="text-gray-600 text-center mb-6">
                Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя
                отменить. Все ваши данные будут безвозвратно удалены.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Отмена
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Удаление...
                    </>
                  ) : (
                    'Удалить аккаунт'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
