# Contributing to Loga SMS Node.js SDK

Thank you for your interest in contributing! We welcome issues, feature requests, and pull requests.

## Issues

- Use **GitHub Issues** to report bugs or suggest features.
- Before opening a new issue, search existing issues to avoid duplicates.
- When reporting a bug, include:
  - Node.js version
  - SDK version
  - Minimal reproduction steps
  - Expected vs actual behavior

## Pull Requests

1. Fork the repository and create a feature branch from `main`.
2. Make your changes following the code style.
3. Add or update tests as needed.
4. Run the test suite: `npm test`
5. Run the build: `npm run build`
6. Ensure linting passes (ESLint + Prettier).
7. Open a PR with a clear title and description.

## Code Style

- **ESLint** — enforce consistent JavaScript/TypeScript style.
- **Prettier** — auto-format code on save or via `npx prettier --write .`
- Follow existing patterns in the codebase.

## Conventional Commits

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new SMS priority option
fix: handle 401 refresh token race condition
docs: update README configuration table
test: add status polling integration test
chore: bump axios dependency
```

## Developer Certificate of Origin (DCO)

By contributing, you agree to the [Developer Certificate of Origin](https://developercertificate.org/). Each commit must include a `Signed-off-by` line:

```
git commit -s -m "feat: add new SMS priority option"
```

This certifies that you have the right to submit the contribution under the MIT license.

## Development Setup

```bash
git clone https://github.com/loga-engineering/loga-sms-nodejs-sdk.git
cd loga-sms-nodejs-sdk
npm install
npm run build
```

## Testing

```bash
npm test
```

## Building

```bash
npm run build
```

---

Thank you for helping improve the Loga SMS Node.js SDK!
