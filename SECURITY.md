# Security Policy

## Supported Versions

The latest published version is supported for security fixes.

## Reporting a Vulnerability

Please do **not** open a public issue for security reports.

- Contact: open a private security advisory on GitHub (preferred)
- Include: reproduction steps, impact, affected files/versions
- Response target: initial acknowledgement within 72 hours

## Secret Handling

- This project never bundles runtime API keys.
- Users must provide their own keys via environment variables.
- Never commit `.env` or tokens to the repository.
