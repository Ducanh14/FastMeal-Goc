function getApiBaseUrl() {
  if (typeof window !== 'undefined' && window.location.hostname.includes('devtunnels.ms')) {
    return window.location.origin.replace('-3001', '-3000');
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
}
const API_BASE_URL = getApiBaseUrl();

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

export interface DailyMenu {
  _id: string | null;
  date: string;
  dishes: Dish[];
}

export async function fetchDishes(): Promise<Dish[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/dishes`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Always fetch fresh data
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dishes: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching dishes:', error);
    throw error;
  }
}

export async function fetchDishById(id: string): Promise<Dish> {
  try {
    const response = await fetch(`${API_BASE_URL}/dishes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dish: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching dish:', error);
    throw error;
  }
}

export async function fetchUserProfile(userId: string): Promise<{ _id: string; fullName: string; email: string; role: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

// ==================== ORDER TYPES ====================
export interface OrderItem {
  dishId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CreateOrderInput {
  userId: string;
  items: OrderItem[];
  total: number;
  customerName: string;
  phone: string;
  address: string;
  note?: string;
}

export interface OrderData {
  _id: string;
  userId: string | { _id: string; fullName: string; email: string };
  items: OrderItem[];
  total: number;
  customerName: string;
  phone: string;
  address: string;
  note: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: OrderData[];
  total: number;
}

// ==================== ORDER API ====================
export async function createOrder(data: CreateOrderInput): Promise<{ message: string; order: OrderData }> {
  const response = await fetch(`${API_BASE_URL}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Failed to create order');
  return response.json();
}

export async function fetchUserOrders(
  userId: string,
  params?: { status?: string; page?: number; limit?: number; startDate?: string; endDate?: string }
): Promise<OrdersResponse> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.startDate) searchParams.set('startDate', params.startDate);
  if (params?.endDate) searchParams.set('endDate', params.endDate);

  const queryString = searchParams.toString();
  const response = await fetch(`${API_BASE_URL}/orders/user/${userId}${queryString ? `?${queryString}` : ''}`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch orders');
  return response.json();
}

export async function updateOrder(
  orderId: string,
  userId: string,
  data: { items?: OrderItem[]; total?: number; customerName?: string; phone?: string; address?: string; note?: string }
): Promise<{ message: string; order: OrderData }> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, ...data }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update order');
  }
  return response.json();
}

export async function cancelOrder(
  orderId: string,
  userId: string,
): Promise<{ message: string; order: OrderData }> {
  const response = await fetch(`${API_BASE_URL}/orders/${orderId}/cancel`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to cancel order');
  }
  return response.json();
}

// ==================== BRANCH TYPES ====================
export interface BranchData {
  _id: string;
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  district: string;
  city: string;
  isActive: boolean;
}

export async function fetchActiveBranches(): Promise<BranchData[]> {
  const response = await fetch(`${API_BASE_URL}/branches?active=true`, {
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Failed to fetch branches');
  return response.json();
}

// ==================== DAILY MENU ====================
export async function fetchTodayMenu(): Promise<DailyMenu | null> {
  try {
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-CA'); // YYYY-MM-DD theo local time
    const response = await fetch(`${API_BASE_URL}/daily-menu?date=${dateStr}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch today's menu: ${response.statusText}`);
    }
    const text = await response.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Error fetching today's menu:", error);
    throw error;
  }
}
