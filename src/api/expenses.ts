import { api } from './client';

export interface Expense {
  id: string;
  amount: number;
  date: string;
  category_id: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCreateRequest {
  amount: number;
  date: string;
  category_id: string;
  description?: string | null;
}

export interface ExpenseUpdateRequest {
  id: string;
  amount?: number | null;
  date?: string | null;
  category_id?: string | null;
  description?: string | null;
}

export interface ExpenseFilters {
  start_date?: string;
  end_date?: string;
  category_id?: string;
}

export async function getExpense(expense_id: string): Promise<Expense> {
  const res = await api.get<Expense>(`/expenses/get/${expense_id}`);
  return res.data;
}

export async function getExpensesByUser(): Promise<Expense[]> {
  const res = await api.get<Expense[]>('/expenses/get-by-user');
  return res.data;
}

export async function getExpensesByDateRange(
  start_date: string,
  end_date: string
): Promise<Expense[]> {
  const res = await api.get<Expense[]>('/expenses/get-by-date-range', {
    params: { start_date, end_date },
  });
  return res.data;
}

export async function getExpensesByCategory(
  category_id: string
): Promise<Expense[]> {
  const res = await api.get<Expense[]>(
    `/expenses/get-by-category/${category_id}`
  );
  return res.data;
}

export async function createExpense(
  data: ExpenseCreateRequest
): Promise<Expense> {
  const res = await api.post<Expense>('/expenses/create', data);
  return res.data;
}

export async function updateExpense(
  data: ExpenseUpdateRequest
): Promise<Expense> {
  const res = await api.put<Expense>('/expenses/update', data);
  return res.data;
}

export async function deleteExpense(expense_id: string): Promise<void> {
  await api.delete(`/expenses/delete/${expense_id}`);
}

export async function getExpensesWithFilters(
  filters: ExpenseFilters = {}
): Promise<Expense[]> {
  const { start_date, end_date, category_id } = filters;

  if (start_date && end_date) {
    return getExpensesByDateRange(start_date, end_date);
  }

  if (category_id) {
    return getExpensesByCategory(category_id);
  }

  return getExpensesByUser();
}
