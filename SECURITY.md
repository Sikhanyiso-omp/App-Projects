# Security Policy

## Reporting a vulnerability

Please do not disclose exploitable vulnerabilities in a public issue. Use GitHub's **Report a vulnerability** option under the repository Security tab so the report can be handled privately.

Include the affected route or component, reproduction steps, impact and any suggested mitigation. Do not include real customer data, passwords, tokens or API keys.

## Supported version

Security fixes are applied to the latest commit on `main`.

## Secret handling

- Never commit `.env` files or production data.
- Use a long, randomly generated `JWT_SECRET`.
- Rotate secrets immediately after suspected exposure.
- Keep production secrets in the deployment platform's secret manager.
