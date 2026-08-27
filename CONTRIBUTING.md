# Contributing

## Development workflow

1. Create a focused branch from `main`.
2. Copy `.env.example` to `.env` and use development-only values.
3. Run `npm ci`.
4. Make a small, reviewable change.
5. Run `npm run lint` and `npm run build`.
6. Open a pull request describing the problem, solution and verification.

## Commit style

Use concise imperative messages, for example:

- `feat: add order cancellation endpoint`
- `fix: prevent inventory from becoming negative`
- `docs: document backup restoration`
- `chore: update container base image`

Never commit secrets, generated data, dependencies or build output.
