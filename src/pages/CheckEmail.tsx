import { useLocation, Link } from 'react-router-dom';

export default function CheckEmail() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email;

  return (
    <div className="max-w-md mx-auto mt-20 p-6 bg-white rounded shadow text-center">
      <h1 className="text-xl font-bold mb-4">Письмо отправлено</h1>
      <p className="mb-4">
        {email
          ? `Мы отправили ссылку для сброса пароля на ${email}.`
          : 'Мы отправили ссылку для сброса пароля на вашу почту.'}
      </p>
      <Link
        to="/login"
        className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Перейти к входу
      </Link>
    </div>
  );
}
