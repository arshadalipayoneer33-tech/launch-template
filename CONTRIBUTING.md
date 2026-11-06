# Contributing to LaunchFlow

Thanks for your interest in improving LaunchFlow, a reusable website and web-app starter.

## Before contributing

- Review the README, especially the demo-mode and production-security limitations.
- Check existing issues and pull requests before starting overlapping work.
- For substantial changes, open an issue describing the problem and proposed approach first.
- Be respectful and constructive in discussions and reviews.

## Local setup

1. Fork the repository and clone your fork.
2. Run `node server.js` (or `python3 server.py`) to start the local demo.
3. Make focused changes on a dedicated branch.
4. Run `npm test` and, if Python 3 is available, `npm run test:py`.
5. Manually check affected pages and features. Report any tests you could not run.

## Pull requests

Include a clear summary, linked issue if applicable, testing performed, and screenshots for visible UI changes. Keep unrelated changes separate. Do not commit secrets, API keys, credentials, or real customer data.

## Security-sensitive changes

Do not treat the demo authentication token, in-memory storage, or sample contact form as production-grade security. See SECURITY.md before reporting vulnerabilities.

## Maintenance expectations

Maintainers review contributions when available. Acceptance and response times are not guaranteed.
