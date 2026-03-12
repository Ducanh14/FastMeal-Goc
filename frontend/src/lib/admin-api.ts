function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname.includes('devtunnels.ms')) {
    return window.location.origin.replace('-3001', '-3000');
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}
const API_BASE_URL = getApiBaseUrl();

// ==================== DISH TYPES ====================
export interface Dish {
  _id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDishInput {
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  isAvailable?: boolean;
}

// ==================== DAILY MENU TYPES ====================
export interface DailyMenu {
  _id: string | null;
  date: string;
  dishes: Dish[];
}

export type WeeklyMenus = Record<number, DailyMenu>;

// ==================== DISH API ====================
export async function fetchAllDishes(): Promise<Dish[]> {
  const response = await fetch(`${API_BASE_URL}/dishes?all=true`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch dishes');
  return response.json();
}

export async function createDish(data: CreateDishInput): Promise<Dish> {
  const response = await fetch(`${API_BASE_URL}/dishes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create dish');
  return response.json();
}

export async function updateDish(id: string, data: Partial<CreateDishInput>): Promise<Dish> {
  const response = await fetch(`${API_BASE_URL}/dishes/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update dish');
  return response.json();
}

export async function deleteDish(id: string): Promise<Dish> {
  const response = await fetch(`${API_BASE_URL}/dishes/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete dish');
  return response.json();
}

// ==================== DAILY MENU API ====================
export async function fetchWeeklyMenus(startDate?: string): Promise<WeeklyMenus> {
  const params = startDate ? `?startDate=${startDate}` : '';
  const response = await fetch(`${API_BASE_URL}/daily-menu/week${params}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch weekly menus');
  return response.json();
}

export async function saveDailyMenu(date: string, dishIds: string[]): Promise<DailyMenu> {
  const response = await fetch(`${API_BASE_URL}/daily-menu`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date, dishIds }),
  });
  if (!response.ok) throw new Error('Failed to save daily menu');
  return response.json();
}

export async function saveWeeklyMenus(
  menus: { date: string; dishIds: string[] }[]
): Promise<DailyMenu[]> {
  const response = await fetch(`${API_BASE_URL}/daily-menu/week`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ menus }),
  });
  if (!response.ok) throw new Error('Failed to save weekly menus');
  return response.json();
}

// ==================== USER TYPES ====================
export interface UserInfo {
  _id: string;
  email: string;
  fullName: string;
  role: 'customer' | 'staff' | 'admin';
  createdAt?: string;
  updatedAt?: string;
}

// ==================== USER API ====================
export async function fetchAllUsers(): Promise<UserInfo[]> {
  const response = await fetch(`${API_BASE_URL}/users`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

export async function updateUserRole(
  userId: string,
  role: 'customer' | 'staff' | 'admin',
): Promise<{ message: string; user: UserInfo }> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error('Failed to update user role');
  return response.json();
}

export async function deleteUser(
  userId: string,
): Promise<{ message: string; user: UserInfo }> {
  const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
}

// ==================== ORDER TYPES ====================
export interface AdminOrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface AdminOrder {
  _id: string;
  userId: string | { _id: string; fullName: string; email: string };
  items: AdminOrderItem[];
  total: number;
  customerName: string;
  phone: string;
  address: string;
  note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminOrdersResponse {
  orders: AdminOrder[];
  total: number;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  statusCounts: Record<string, number>;
  todayOrders: number;
  todayRevenue: number;
}

// ==================== ORDER API ====================
export async function fetchAllOrders(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<AdminOrdersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.search) searchParams.set('search', params.search);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);
  if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
  if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

  const queryString = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/orders${queryString ? `?${queryString}` : ''}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function fetchOrderStats(): Promise<OrderStats> {
  const response = await fetch(`${API_BASE_URL}/orders/stats`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch order stats');
  return response.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: string,
): Promise<{ message: string; order: AdminOrder }> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update order status');
  return response.json();
}

// ==================== BRANCH TYPES ====================
export interface Branch {
  _id: string;
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  district: string;
  city: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBranchInput {
  name: string;
  address: string;
  phone: string;
  openingHours?: string;
  district?: string;
  city?: string;
  isActive?: boolean;
}

// ==================== BRANCH API ====================
export async function fetchAllBranches(): Promise<Branch[]> {
  const response = await fetch(`${API_BASE_URL}/branches`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch branches');
  return response.json();
}

export async function createBranch(data: CreateBranchInput): Promise<{ message: string; branch: Branch }> {
  const response = await fetch(`${API_BASE_URL}/branches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create branch');
  return response.json();
}

export async function updateBranch(id: string, data: Partial<CreateBranchInput>): Promise<{ message: string; branch: Branch }> {
  const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to update branch');
  return response.json();
}

export async function deleteBranch(id: string): Promise<{ message: string; branch: Branch }> {
  const response = await fetch(`${API_BASE_URL}/branches/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete branch');
  return response.json();
}
