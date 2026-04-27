export type ApiUser = { id: number; email: string; role: 'customer' | 'admin' };

export type Product = {
  id: number;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  inventory: number;
};

export type CartItem = Product & { quantity: number };

export type Order = {
  id: number;
  totalCents: number;
  status: string;
  shippingAddress: string;
  createdAt: string;
};
