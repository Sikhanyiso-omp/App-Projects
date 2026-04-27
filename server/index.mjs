import 'dotenv/config';
import express from 'express';
import { createHmac, randomBytes, timingSafeEqual, scryptSync } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';

const app = express();
const port = Number(process.env.PORT || 4000);
const dbPath = process.env.DB_PATH || './data/legacy-wear.json';
const jwtSecret = process.env.JWT_SECRET || 'dev-only-secret-change-me';
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';

if (!existsSync(dirname(dbPath))) mkdirSync(dirname(dbPath), { recursive: true });

function defaultDb() {
  return {
    users: [],
    products: [
      { id: 1, name: 'Legacy Ankara Jacket', description: 'Premium tailored jacket blending traditional African pattern work with modern cuts.', priceCents: 15999, imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800', inventory: 15 },
      { id: 2, name: 'Heritage Linen Dress', description: 'Breathable linen dress crafted for effortless elegance in warm weather.', priceCents: 11999, imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800', inventory: 22 },
      { id: 3, name: 'Ngxatsho Signature Set', description: 'Two-piece statement set for events and premium streetwear styling.', priceCents: 18999, imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800', inventory: 8 },
    ],
    orders: [],
    nextIds: { user: 1, order: 1 },
  };
}

function loadDb() {
  if (!existsSync(dbPath)) {
    const db = defaultDb();
    writeFileSync(dbPath, JSON.stringify(db, null, 2));
    return db;
  }
  return JSON.parse(readFileSync(dbPath, 'utf8'));
}

let db = loadDb();
const persist = () => writeFileSync(dbPath, JSON.stringify(db, null, 2));

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Access-Control-Allow-Origin', corsOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use(express.json({ limit: '1mb' }));

const ipHits = new Map();
app.use((req, res, next) => {
  const key = `${req.ip}:${Math.floor(Date.now() / 60000)}`;
  ipHits.set(key, (ipHits.get(key) || 0) + 1);
  if (ipHits.get(key) > 120) return res.status(429).json({ message: 'Too many requests' });
  next();
});

const base64url = (s) => Buffer.from(s).toString('base64url');
function signToken(payload) {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 }));
  const sig = createHmac('sha256', jwtSecret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${sig}`;
}
function verifyToken(token) {
  const [h, b, s] = token.split('.');
  if (!h || !b || !s) throw new Error('Malformed token');
  const expected = createHmac('sha256', jwtSecret).update(`${h}.${b}`).digest('base64url');
  if (!timingSafeEqual(Buffer.from(s), Buffer.from(expected))) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(b, 'base64url').toString('utf8'));
  if (payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Expired');
  return payload;
}

function hashPassword(password, salt = randomBytes(16).toString('hex')) {
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
function verifyPassword(password, hashed) {
  const [salt, hash] = hashed.split(':');
  const candidate = scryptSync(password, salt, 64).toString('hex');
  return timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));
}

function validateAuth(body) {
  if (!body?.email || !body?.password) return 'Email and password are required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return 'Invalid email';
  if (String(body.password).length < 8) return 'Password must be at least 8 characters';
  return null;
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = verifyToken(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

app.post('/api/auth/register', (req, res) => {
  const error = validateAuth(req.body);
  if (error) return res.status(400).json({ message: error });
  const email = req.body.email.toLowerCase().trim();
  if (db.users.some((u) => u.email === email)) return res.status(409).json({ message: 'Email already exists' });

  const user = { id: db.nextIds.user++, email, passwordHash: hashPassword(req.body.password), role: 'customer', createdAt: new Date().toISOString() };
  db.users.push(user);
  persist();
  return res.status(201).json({ token: signToken({ sub: user.id, email: user.email, role: user.role }), user: { id: user.id, email: user.email, role: user.role } });
});

app.post('/api/auth/login', (req, res) => {
  const error = validateAuth(req.body);
  if (error) return res.status(400).json({ message: error });
  const email = req.body.email.toLowerCase().trim();
  const user = db.users.find((u) => u.email === email);
  if (!user || !verifyPassword(req.body.password, user.passwordHash)) return res.status(401).json({ message: 'Invalid credentials' });
  return res.json({ token: signToken({ sub: user.id, email: user.email, role: user.role }), user: { id: user.id, email: user.email, role: user.role } });
});

app.get('/api/products', (_req, res) => {
  res.json({ data: db.products });
});

app.post('/api/orders', requireAuth, (req, res) => {
  const { shippingAddress, items } = req.body || {};
  if (!shippingAddress || String(shippingAddress).trim().length < 10) return res.status(400).json({ message: 'Invalid shipping address' });
  if (!Array.isArray(items) || items.length < 1) return res.status(400).json({ message: 'Order items required' });

  let totalCents = 0;
  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId);
    if (!product) return res.status(400).json({ message: `Invalid product ${item.productId}` });
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 10) return res.status(400).json({ message: 'Invalid quantity' });
    if (product.inventory < item.quantity) return res.status(400).json({ message: `Insufficient inventory for ${product.name}` });
    totalCents += product.priceCents * item.quantity;
  }

  for (const item of items) {
    const product = db.products.find((p) => p.id === item.productId);
    product.inventory -= item.quantity;
  }

  const order = {
    id: db.nextIds.order++,
    userId: req.user.sub,
    items,
    totalCents,
    shippingAddress: String(shippingAddress).trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  db.orders.push(order);
  persist();
  res.status(201).json({ id: order.id, totalCents: order.totalCents, status: order.status });
});

app.get('/api/orders/me', requireAuth, (req, res) => {
  res.json({ data: db.orders.filter((o) => o.userId === req.user.sub) });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => console.log(`Legacy Wear API listening on http://localhost:${port}`));
