# Architecture

## Context

Ngxatsho Legacy Wear is a compact commerce application designed to demonstrate clear service boundaries and a deployable container topology.

## Components

| Component | Responsibility |
| --- | --- |
| React frontend | Catalogue, authentication UI, cart, checkout and order history |
| Nginx | Static assets, SPA fallback, health endpoint and reverse proxy |
| Express API | Authentication, validation, products, inventory and orders |
| Persistent volume | File-backed data for a single API replica |
| GitHub Actions | Reproducible type-check, build and container validation |

## Request flow

1. A customer opens the Nginx service.
2. Nginx serves the compiled React application.
3. Browser requests under `/api` are proxied to the API container.
4. The API validates input and bearer tokens before applying business rules.
5. Orders and inventory changes are written to the mounted data volume.

## Security boundaries

- The browser never receives `JWT_SECRET`.
- The API is not published directly in the Compose topology.
- Authentication and price calculations are performed server-side.
- CORS, body limits, security headers and per-IP rate limiting reduce common abuse.
- Environment files and persisted customer data are excluded from Git.

## Scaling path

The current datastore supports one API replica. Horizontal scaling requires:

1. PostgreSQL for transactional inventory and order state.
2. Redis or an API gateway for distributed rate limits.
3. Managed secrets and key rotation.
4. Central logs, metrics and alerting.
5. Database backups and tested restore procedures.
