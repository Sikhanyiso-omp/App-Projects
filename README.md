# Ngxatsho Legacy Wear - Commercial-Grade Starter

A full-stack ecommerce application for Legacy Wear with secure authentication, product catalog, cart, and order management.

## Architecture
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express REST API with validation, authentication, and inventory/order logic
- **Database**: File-backed JSON datastore (`data/legacy-wear.json`) with seeded catalog data
- **Auth**: Email/password login plus signed bearer tokens

## Quick Start
1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment file:
   ```bash
   cp .env.example .env
   ```
3. Run backend API:
   ```bash
   npm run dev:server
   ```
4. Run frontend app:
   ```bash
   npm run dev
   ```

## API Endpoints
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/products`
- `POST /api/orders`
- `GET /api/orders/me`

## Security Highlights
- Security response headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)
- CORS allowlist from env
- Rate limiting per IP window
- Password hashing via Node crypto `scrypt`
- Signed bearer token auth
- Input validation with strict server-side checks

## Testing Strategy
- Unit tests for service logic and validation rules
- Integration tests for auth/orders endpoints
- E2E tests for catalog/cart/checkout user journeys
- Security tests for auth, rate limits, and malformed input

## Deployment
- Build frontend: `npm run build`
- Run API with `npm run start:server` behind a reverse proxy (Nginx/Caddy)
- Persist the `data/` volume
- Set production env vars for `JWT_SECRET`, `CORS_ORIGIN`, `DB_PATH`, `PORT`
