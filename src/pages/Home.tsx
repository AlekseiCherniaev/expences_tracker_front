import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  return (
    <div>
      <h1>Добро пожаловать, {user}!</h1>
      <button onClick={handleLogout}>Выйти</button>
    </div>
  );
}
