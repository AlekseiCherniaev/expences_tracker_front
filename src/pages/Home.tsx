import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_default: boolean;
  created_at: string;
}

interface Expense {
  id: string;
  amount: number;
  date: string;
  description?: string;
  category_id: string;
  created_at: string;
}

export default function Home() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#000000',
    is_default: false,
  });

  const [newExpense, setNewExpense] = useState({
    amount: '',
    date: '',
    category_id: '',
    description: '',
  });

  useEffect(() => {
    fetchCategories();
    fetchExpenses();
  }, []);

  async function fetchCategories() {
    const res = await api.get('/categories/get-by-user');
    setCategories(res.data);
  }

  async function fetchExpenses() {
    const res = await api.get('/expenses/get-by-user');
    setExpenses(res.data);
  }

  async function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/categories/create', newCategory);
    setNewCategory({
      name: '',
      description: '',
      color: '#000000',
      is_default: false,
    });
    fetchCategories();
  }

  async function handleDeleteCategory(id: string) {
    if (!window.confirm('Удалить категорию?')) return;
    await api.delete(`/categories/delete/${id}`);
    fetchCategories();
  }

  async function handleCreateExpense(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/expenses/create', {
      ...newExpense,
      amount: parseFloat(newExpense.amount),
    });
    setNewExpense({ amount: '', date: '', category_id: '', description: '' });
    fetchExpenses();
  }

  async function handleDeleteExpense(id: string) {
    if (!window.confirm('Удалить расход?')) return;
    await api.delete(`/expenses/delete/${id}`);
    fetchExpenses();
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Главная</h1>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={() => navigate('/me')}>Профиль</button>{' '}
        <button onClick={logoutUser}>Выйти</button>
      </div>

      <h2>Категории</h2>
      <form onSubmit={handleCreateCategory}>
        <input
          placeholder="Название"
          value={newCategory.name}
          onChange={(e) =>
            setNewCategory({ ...newCategory, name: e.target.value })
          }
        />
        <input
          placeholder="Описание"
          value={newCategory.description}
          onChange={(e) =>
            setNewCategory({ ...newCategory, description: e.target.value })
          }
        />
        <input
          type="color"
          value={newCategory.color}
          onChange={(e) =>
            setNewCategory({ ...newCategory, color: e.target.value })
          }
        />
        <button type="submit">Добавить</button>
      </form>

      <ul>
        {categories.map((cat) => (
          <li key={cat.id}>
            <span style={{ color: cat.color }}>{cat.name}</span> —{' '}
            {cat.description}{' '}
            <button onClick={() => handleDeleteCategory(cat.id)}>
              Удалить
            </button>
          </li>
        ))}
      </ul>

      <h2>Расходы</h2>
      <form onSubmit={handleCreateExpense}>
        <input
          placeholder="Сумма"
          type="number"
          value={newExpense.amount}
          onChange={(e) =>
            setNewExpense({ ...newExpense, amount: e.target.value })
          }
        />
        <input
          type="date"
          value={newExpense.date}
          onChange={(e) =>
            setNewExpense({ ...newExpense, date: e.target.value })
          }
        />
        <select
          value={newExpense.category_id}
          onChange={(e) =>
            setNewExpense({ ...newExpense, category_id: e.target.value })
          }
        >
          <option value="">Выбери категорию</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <input
          placeholder="Описание"
          value={newExpense.description}
          onChange={(e) =>
            setNewExpense({ ...newExpense, description: e.target.value })
          }
        />
        <button type="submit">Добавить</button>
      </form>

      <ul>
        {expenses.map((exp) => (
          <li key={exp.id}>
            {exp.amount}₽ — {exp.date.slice(0, 10)} —{' '}
            {exp.description || 'без описания'}{' '}
            <button onClick={() => handleDeleteExpense(exp.id)}>Удалить</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
