import type { ApiUser, Order, Product } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

type AuthResponse = { token: string; user: ApiUser };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Request failed');
  return body as T;
}

export const api = {
  register(email: string, password: string) {
    return request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  login(email: string, password: string) {
    return request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  products() {
    return request<{ data: Product[] }>('/products');
  },
  createOrder(token: string, payload: { shippingAddress: string; items: { productId: number; quantity: number }[] }) {
    return request<{ id: number; totalCents: number; status: string }>('/orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(payload),
    });
  },
  myOrders(token: string) {
    return request<{ data: Order[] }>('/orders/me', { headers: { Authorization: `Bearer ${token}` } });
  },
};
