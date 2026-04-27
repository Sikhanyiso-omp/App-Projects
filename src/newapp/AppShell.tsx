import { useEffect, useMemo, useState } from 'react';
import { api } from './api';
import type { ApiUser, CartItem, Order, Product } from './types';

const toMoney = (cents: number) => `$${(cents / 100).toFixed(2)}`;

export function AppShell() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('legacy_token'));
  const [user, setUser] = useState<ApiUser | null>(JSON.parse(localStorage.getItem('legacy_user') || 'null'));
  const [orders, setOrders] = useState<Order[]>([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.products().then((r) => setProducts(r.data)).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!token) return;
    api.myOrders(token).then((r) => setOrders(r.data)).catch(() => setOrders([]));
  }, [token]);

  const subtotal = useMemo(() => cart.reduce((sum, i) => sum + i.priceCents * i.quantity, 0), [cart]);

  const onAuth = async () => {
    setError('');
    try {
      const res = isLogin ? await api.login(email, password) : await api.register(email, password);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('legacy_token', res.token);
      localStorage.setItem('legacy_user', JSON.stringify(res.user));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Authentication failed');
    }
  };

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const checkout = async () => {
    if (!token) return setError('Please login to checkout.');
    if (shippingAddress.trim().length < 10) return setError('Shipping address must be at least 10 characters.');
    try {
      await api.createOrder(token, {
        shippingAddress,
        items: cart.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      setCart([]);
      setShippingAddress('');
      const refreshed = await api.myOrders(token);
      setOrders(refreshed.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Checkout failed');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-10">
      <header className="max-w-6xl mx-auto mb-10 flex flex-wrap gap-4 justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ngxatsho Legacy Wear</h1>
          <p className="text-neutral-400 text-sm">Production-ready commerce foundation</p>
        </div>
        <div className="text-sm text-neutral-300">{user ? `Signed in as ${user.email}` : 'Guest session'}</div>
      </header>

      {!!error && <p className="max-w-6xl mx-auto mb-4 text-red-400 text-sm">{error}</p>}

      {!user && (
        <section className="max-w-6xl mx-auto mb-8 p-4 border border-neutral-800 rounded-xl bg-neutral-900/40">
          <h2 className="font-semibold mb-3">Customer authentication</h2>
          <div className="grid md:grid-cols-4 gap-3">
            <input className="bg-neutral-900 border border-neutral-700 rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input className="bg-neutral-900 border border-neutral-700 rounded p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <button className="bg-white text-black rounded px-4 py-2 font-semibold" onClick={onAuth}>{isLogin ? 'Login' : 'Register'}</button>
            <button className="border border-neutral-700 rounded px-4 py-2" onClick={() => setIsLogin((v) => !v)}>Switch to {isLogin ? 'Register' : 'Login'}</button>
          </div>
        </section>
      )}

      <main className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Catalog</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {products.map((p) => (
              <article key={p.id} className="border border-neutral-800 rounded-xl overflow-hidden bg-neutral-900/30">
                <img src={p.imageUrl} alt={p.name} className="h-48 w-full object-cover" loading="lazy" />
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-sm text-neutral-400">{p.description}</p>
                  <div className="flex justify-between items-center">
                    <span>{toMoney(p.priceCents)}</span>
                    <button onClick={() => addToCart(p)} className="bg-white text-black text-sm px-3 py-1 rounded">Add</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-6">
          <section className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/40">
            <h2 className="font-semibold mb-3">Cart</h2>
            <div className="space-y-2 mb-3">
              {cart.map((item) => (
                <div className="flex justify-between text-sm" key={item.id}>
                  <span>{item.name} × {item.quantity}</span>
                  <span>{toMoney(item.priceCents * item.quantity)}</span>
                </div>
              ))}
              {cart.length === 0 && <p className="text-sm text-neutral-500">No items yet.</p>}
            </div>
            <p className="font-semibold mb-2">Subtotal: {toMoney(subtotal)}</p>
            <textarea className="w-full bg-neutral-900 border border-neutral-700 rounded p-2 text-sm mb-2" rows={3} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} placeholder="Shipping address" />
            <button className="w-full bg-white text-black rounded py-2 disabled:opacity-50" onClick={checkout} disabled={!cart.length}>Checkout</button>
          </section>

          <section className="border border-neutral-800 rounded-xl p-4 bg-neutral-900/40">
            <h2 className="font-semibold mb-3">My Orders</h2>
            <div className="space-y-2 text-sm">
              {orders.map((o) => <p key={o.id}>#{o.id} · {toMoney(o.totalCents)} · {o.status}</p>)}
              {orders.length === 0 && <p className="text-neutral-500">No orders yet.</p>}
            </div>
          </section>
        </aside>
      </main>
    </div>
  );
}
