import { api } from './client';

export enum BudgetPeriod {
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export interface Budget {
  id: string;
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  user_id: string;
  category_id: string;
  created_at: string;
  updated_at: string;
}

export interface BudgetCreateRequest {
  amount: number;
  period: BudgetPeriod;
  start_date: string;
  end_date: string;
  category_id: string;
}

export interface BudgetUpdateRequest {
  id: string;
  amount?: number | null;
  period?: BudgetPeriod | null;
  start_date?: string | null;
  end_date?: string | null;
  category_id?: string | null;
}

export interface BudgetFilters {
  start_date?: string;
  end_date?: string;
  category_id?: string;
  period?: BudgetPeriod;
  current_date?: string;
}

export async function getBudget(budget_id: string): Promise<Budget> {
  const res = await api.get<Budget>(`/budgets/get/${budget_id}`);
  return res.data;
}

export async function getBudgetsByUser(): Promise<Budget[]> {
  const res = await api.get<Budget[]>('/budgets/get-by-user');
  return res.data;
}

export async function getBudgetsByDateRange(
  start_date: string,
  end_date: string
): Promise<Budget[]> {
  const res = await api.get<Budget[]>('/budgets/get-by-user-date-range', {
    params: { start_date, end_date },
  });
  return res.data;
}

export async function getBudgetsByCategory(
  category_id: string
): Promise<Budget[]> {
  const res = await api.get<Budget[]>(
    `/budgets/get-by-user-category/${category_id}`
  );
  return res.data;
}

export async function getActiveBudgets(
  current_date: string
): Promise<Budget[]> {
  const res = await api.get<Budget[]>('/budgets/get-active-by-user', {
    params: { current_date },
  });
  return res.data;
}

export async function getBudgetsByPeriod(
  period: BudgetPeriod
): Promise<Budget[]> {
  const res = await api.get<Budget[]>(`/budgets/get-by-user-period/${period}`);
  return res.data;
}

export async function createBudget(data: BudgetCreateRequest): Promise<Budget> {
  const res = await api.post<Budget>('/budgets/create', data);
  return res.data;
}

export async function updateBudget(data: BudgetUpdateRequest): Promise<Budget> {
  const res = await api.put<Budget>('/budgets/update', data);
  return res.data;
}

export async function deleteBudget(budget_id: string): Promise<void> {
  await api.delete(`/budgets/delete/${budget_id}`);
}

export async function getTotalBudgetAmount(
  start_date: string,
  end_date: string
): Promise<number> {
  const res = await api.get<number>('/budgets/total-amount', {
    params: { start_date, end_date },
  });
  return res.data;
}

export async function getBudgetsWithFilters(
  filters: BudgetFilters = {}
): Promise<Budget[]> {
  const { start_date, end_date, category_id, period, current_date } = filters;

  if (start_date && end_date) {
    return getBudgetsByDateRange(start_date, end_date);
  }

  if (category_id) {
    return getBudgetsByCategory(category_id);
  }

  if (period) {
    return getBudgetsByPeriod(period);
  }

  if (current_date) {
    return getActiveBudgets(current_date);
  }

  return getBudgetsByUser();
}
