import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  getCategoriesByUser,
  createCategory,
  updateCategory,
  deleteCategory,
  Category,
  CategoryCreateRequest,
  getExpensesByUser,
  getExpensesByDateRange,
  getExpensesByCategory,
  createExpense,
  updateExpense,
  deleteExpense,
  Expense,
  ExpenseCreateRequest,
  getActiveBudgets,
  getBudgetsByPeriod,
  getTotalBudgetAmount,
  getBudgetsWithFilters,
  createBudget,
  updateBudget,
  deleteBudget,
  Budget,
  BudgetCreateRequest,
  BudgetPeriod,
  BudgetFilters,
} from '../api';

export default function Home() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<Category[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [activeBudgets, setActiveBudgets] = useState<Budget[]>([]);
  const [totalBudgetAmount, setTotalBudgetAmount] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [expenseFilters, setExpenseFilters] = useState({
    start_date: '',
    end_date: '',
    category_id: '',
  });

  const [budgetFilters, setBudgetFilters] = useState<BudgetFilters>({});
  const [selectedPeriod, setSelectedPeriod] = useState<BudgetPeriod>(
    BudgetPeriod.MONTHLY
  );

  const [newCategory, setNewCategory] = useState<CategoryCreateRequest>({
    name: '',
    description: '',
    color: '#3B82F6',
    is_default: false,
  });

  const [newExpense, setNewExpense] = useState<ExpenseCreateRequest>({
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    category_id: '',
    description: '',
  });

  const [newBudget, setNewBudget] = useState<BudgetCreateRequest>({
    amount: 0,
    period: BudgetPeriod.MONTHLY,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
      .toISOString()
      .split('T')[0],
    category_id: '',
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        fetchCategories(),
        fetchExpenses(),
        fetchBudgets(),
        fetchActiveBudgets(),
        fetchTotalBudgetAmount(),
      ]);
    } catch (error) {
      setMessage('Ошибка загрузки данных ❌');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    const data = await getCategoriesByUser();
    setCategories(data);
  };

  const fetchExpenses = async (filters = expenseFilters) => {
    let data: Expense[];

    if (filters.start_date && filters.end_date) {
      data = await getExpensesByDateRange(filters.start_date, filters.end_date);
    } else if (filters.category_id) {
      data = await getExpensesByCategory(filters.category_id);
    } else {
      data = await getExpensesByUser();
    }

    setExpenses(data);
  };

  const fetchBudgets = async (filters = budgetFilters) => {
    const data = await getBudgetsWithFilters(filters);
    setBudgets(data);
  };

  const fetchActiveBudgets = async () => {
    const data = await getActiveBudgets(new Date().toISOString());
    setActiveBudgets(data);
  };

  const fetchTotalBudgetAmount = async () => {
    const startDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).toISOString();
    const endDate = new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      0
    ).toISOString();
    const amount = await getTotalBudgetAmount(startDate, endDate);
    setTotalBudgetAmount(amount);
  };

  const fetchBudgetsByPeriod = async (period: BudgetPeriod) => {
    const data = await getBudgetsByPeriod(period);
    setBudgets(data);
  };

  const handleExpenseFilterApply = () => {
    fetchExpenses(expenseFilters);
    setShowFiltersModal(false);
  };

  const handleExpenseFilterReset = () => {
    setExpenseFilters({ start_date: '', end_date: '', category_id: '' });
    fetchExpenses({ start_date: '', end_date: '', category_id: '' });
    setShowFiltersModal(false);
  };

  const handleBudgetPeriodChange = (period: BudgetPeriod) => {
    setSelectedPeriod(period);
    fetchBudgetsByPeriod(period);
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory(newCategory);
      setMessage('Категория создана ✅');
      setNewCategory({
        name: '',
        description: '',
        color: '#3B82F6',
        is_default: false,
      });
      setShowCategoryModal(false);
      fetchCategories();
    } catch {
      setMessage('Ошибка создания категории ❌');
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateCategory(editingItem);
      setMessage('Категория обновлена ✅');
      setShowCategoryModal(false);
      setEditingItem(null);
      fetchCategories();
    } catch {
      setMessage('Ошибка обновления категории ❌');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Удалить категорию?')) return;
    try {
      await deleteCategory(id);
      setMessage('Категория удалена ✅');
      fetchCategories();
    } catch {
      setMessage('Ошибка удаления категории ❌');
    }
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createExpense(newExpense);
      setMessage('Расход добавлен ✅');
      setNewExpense({
        amount: 0,
        date: new Date().toISOString().split('T')[0],
        category_id: '',
        description: '',
      });
      setShowExpenseModal(false);
      fetchExpenses();
      fetchTotalBudgetAmount();
    } catch {
      setMessage('Ошибка добавления расхода ❌');
    }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateExpense(editingItem);
      setMessage('Расход обновлен ✅');
      setShowExpenseModal(false);
      setEditingItem(null);
      fetchExpenses();
      fetchTotalBudgetAmount();
    } catch {
      setMessage('Ошибка обновления расхода ❌');
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('Удалить расход?')) return;
    try {
      await deleteExpense(id);
      setMessage('Расход удален ✅');
      fetchExpenses();
      fetchTotalBudgetAmount();
    } catch {
      setMessage('Ошибка удаления расхода ❌');
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createBudget(newBudget);
      setMessage('Бюджет создан ✅');
      setNewBudget({
        amount: 0,
        period: BudgetPeriod.MONTHLY,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date(new Date().setMonth(new Date().getMonth() + 1))
          .toISOString()
          .split('T')[0],
        category_id: '',
      });
      setShowBudgetModal(false);
      fetchBudgets();
      fetchActiveBudgets();
      fetchTotalBudgetAmount();
    } catch {
      setMessage('Ошибка создания бюджета ❌');
    }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateBudget(editingItem);
      setMessage('Бюджет обновлен ✅');
      setShowBudgetModal(false);
      setEditingItem(null);
      fetchBudgets();
      fetchActiveBudgets();
      fetchTotalBudgetAmount();
    } catch {
      setMessage('Ошибка обновления бюджета ❌');
    }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!window.confirm('Удалить бюджет?')) return;
    try {
      await deleteBudget(id);
      setMessage('Бюджет удален ✅');
      fetchBudgets();
      fetchActiveBudgets();
      fetchTotalBudgetAmount();
    } catch {
      setMessage('Ошибка удаления бюджета ❌');
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : 'Неизвестно';
  };

  const getCategoryColor = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.color : '#6B7280';
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
    }).format(amount);
  };

  const getPeriodDisplayName = (period: BudgetPeriod) => {
    const names = {
      [BudgetPeriod.WEEKLY]: 'Еженедельный',
      [BudgetPeriod.MONTHLY]: 'Ежемесячный',
      [BudgetPeriod.YEARLY]: 'Ежегодный',
    };
    return names[period];
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Финансовый менеджер
              </h1>
              <p className="text-gray-600 mt-2">
                Добро пожаловать, {user.username}! 👋
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/me')}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                👤 Профиль
              </button>
              <button
                onClick={logoutUser}
                className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors"
              >
                🚪 Выйти
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Общий бюджет
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(totalBudgetAmount)}
                </p>
                <p className="text-xs text-gray-500 mt-1">текущий месяц</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Всего расходов
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {formatCurrency(getTotalExpenses())}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {expenseFilters.start_date && expenseFilters.end_date
                    ? 'за выбранный период'
                    : 'все время'}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Активные бюджеты
                </p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {activeBudgets.length}
                </p>
                <p className="text-xs text-gray-500 mt-1">на текущую дату</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <span className="text-2xl">🎯</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Категории</h2>
                <button
                  onClick={() => {
                    setEditingItem(null);
                    setShowCategoryModal(true);
                  }}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors text-sm"
                >
                  + Добавить
                </button>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {categories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {category.name}
                        </p>
                        {category.description && (
                          <p className="text-sm text-gray-500">
                            {category.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(category);
                          setShowCategoryModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Расходы
                  {(expenseFilters.start_date ||
                    expenseFilters.category_id) && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      ({expenses.length} записей)
                    </span>
                  )}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFiltersModal(true)}
                    className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors text-sm"
                  >
                    🔍 Фильтры
                  </button>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowExpenseModal(true);
                    }}
                    className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors text-sm"
                  >
                    + Добавить
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {expenses.slice(0, 10).map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: getCategoryColor(
                            expense.category_id
                          ),
                        }}
                      />
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(expense.amount)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getCategoryName(expense.category_id)} •{' '}
                          {new Date(expense.date).toLocaleDateString('ru-RU')}
                          {expense.description && ` • ${expense.description}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(expense);
                          setShowExpenseModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {expenses.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Нет расходов</p>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Бюджеты
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    ({getPeriodDisplayName(selectedPeriod)})
                  </span>
                </h2>
                <div className="flex gap-2">
                  <select
                    value={selectedPeriod}
                    onChange={(e) =>
                      handleBudgetPeriodChange(e.target.value as BudgetPeriod)
                    }
                    className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={BudgetPeriod.WEEKLY}>Еженедельные</option>
                    <option value={BudgetPeriod.MONTHLY}>Ежемесячные</option>
                    <option value={BudgetPeriod.YEARLY}>Ежегодные</option>
                  </select>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowBudgetModal(true);
                    }}
                    className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm"
                  >
                    + Добавить
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <span className="text-purple-600">🎯</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(budget.amount)} /{' '}
                          {getPeriodDisplayName(budget.period)}
                        </p>
                        <p className="text-sm text-gray-500">
                          {getCategoryName(budget.category_id)} •{' '}
                          {new Date(budget.start_date).toLocaleDateString(
                            'ru-RU'
                          )}{' '}
                          -{' '}
                          {new Date(budget.end_date).toLocaleDateString(
                            'ru-RU'
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingItem(budget);
                          setShowBudgetModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteBudget(budget.id)}
                        className="text-red-600 hover:text-red-700 text-sm"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {budgets.length === 0 && (
                  <p className="text-center text-gray-500 py-4">Нет бюджетов</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showFiltersModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Фильтры расходов
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Период с
                  </label>
                  <input
                    type="date"
                    value={expenseFilters.start_date}
                    onChange={(e) =>
                      setExpenseFilters({
                        ...expenseFilters,
                        start_date: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Период по
                  </label>
                  <input
                    type="date"
                    value={expenseFilters.end_date}
                    onChange={(e) =>
                      setExpenseFilters({
                        ...expenseFilters,
                        end_date: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Категория
                  </label>
                  <select
                    value={expenseFilters.category_id}
                    onChange={(e) =>
                      setExpenseFilters({
                        ...expenseFilters,
                        category_id: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Все категории</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleExpenseFilterReset}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Сбросить
                </button>
                <button
                  onClick={handleExpenseFilterApply}
                  className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Применить
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingItem ? 'Редактировать категорию' : 'Новая категория'}
              </h2>
              <form
                onSubmit={
                  editingItem ? handleUpdateCategory : handleCreateCategory
                }
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название
                    </label>
                    <input
                      type="text"
                      required
                      value={editingItem ? editingItem.name : newCategory.name}
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              name: e.target.value,
                            })
                          : setNewCategory({
                              ...newCategory,
                              name: e.target.value,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <input
                      type="text"
                      value={
                        editingItem
                          ? editingItem.description
                          : newCategory.description
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              description: e.target.value,
                            })
                          : setNewCategory({
                              ...newCategory,
                              description: e.target.value,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цвет
                    </label>
                    <input
                      type="color"
                      value={
                        editingItem ? editingItem.color : newCategory.color
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              color: e.target.value,
                            })
                          : setNewCategory({
                              ...newCategory,
                              color: e.target.value,
                            })
                      }
                      className="w-full h-10 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCategoryModal(false);
                      setEditingItem(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editingItem ? 'Обновить' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showExpenseModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingItem ? 'Редактировать расход' : 'Новый расход'}
              </h2>
              <form
                onSubmit={
                  editingItem ? handleUpdateExpense : handleCreateExpense
                }
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сумма
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={
                        editingItem ? editingItem.amount : newExpense.amount
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              amount: parseFloat(e.target.value),
                            })
                          : setNewExpense({
                              ...newExpense,
                              amount: parseFloat(e.target.value),
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата
                    </label>
                    <input
                      type="date"
                      required
                      value={editingItem ? editingItem.date : newExpense.date}
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              date: e.target.value,
                            })
                          : setNewExpense({
                              ...newExpense,
                              date: e.target.value,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Категория
                    </label>
                    <select
                      required
                      value={
                        editingItem
                          ? editingItem.category_id
                          : newExpense.category_id
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              category_id: e.target.value,
                            })
                          : setNewExpense({
                              ...newExpense,
                              category_id: e.target.value,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Описание
                    </label>
                    <input
                      type="text"
                      value={
                        editingItem
                          ? editingItem.description
                          : newExpense.description
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              description: e.target.value,
                            })
                          : setNewExpense({
                              ...newExpense,
                              description: e.target.value,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowExpenseModal(false);
                      setEditingItem(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
                  >
                    {editingItem ? 'Обновить' : 'Добавить'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showBudgetModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingItem ? 'Редактировать бюджет' : 'Новый бюджет'}
              </h2>
              <form
                onSubmit={editingItem ? handleUpdateBudget : handleCreateBudget}
              >
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сумма
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={
                        editingItem ? editingItem.amount : newBudget.amount
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              amount: parseFloat(e.target.value),
                            })
                          : setNewBudget({
                              ...newBudget,
                              amount: parseFloat(e.target.value),
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Период
                    </label>
                    <select
                      required
                      value={
                        editingItem ? editingItem.period : newBudget.period
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              period: e.target.value as BudgetPeriod,
                            })
                          : setNewBudget({
                              ...newBudget,
                              period: e.target.value as BudgetPeriod,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value={BudgetPeriod.WEEKLY}>Еженедельный</option>
                      <option value={BudgetPeriod.MONTHLY}>Ежемесячный</option>
                      <option value={BudgetPeriod.YEARLY}>Ежегодный</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата начала
                    </label>
                    <input
                      type="date"
                      required
                      value={
                        editingItem
                          ? editingItem.start_date
                          : newBudget.start_date
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              start_date: e.target.value,
                            })
                          : setNewBudget({
                              ...newBudget,
                              start_date: e.target.value,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Дата окончания
                    </label>
                    <input
                      type="date"
                      required
                      value={
                        editingItem ? editingItem.end_date : newBudget.end_date
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              end_date: e.target.value,
                            })
                          : setNewBudget({
                              ...newBudget,
                              end_date: e.target.value,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Категория
                    </label>
                    <select
                      required
                      value={
                        editingItem
                          ? editingItem.category_id
                          : newBudget.category_id
                      }
                      onChange={(e) =>
                        editingItem
                          ? setEditingItem({
                              ...editingItem,
                              category_id: e.target.value,
                            })
                          : setNewBudget({
                              ...newBudget,
                              category_id: e.target.value,
                            })
                      }
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Выберите категорию</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBudgetModal(false);
                      setEditingItem(null);
                    }}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    {editingItem ? 'Обновить' : 'Создать'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
