# HTTP Status Checker

[![CI](https://github.com/mustafaautomation/http-status-checker/actions/workflows/ci.yml/badge.svg)](https://github.com/mustafaautomation/http-status-checker/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

Health check CLI — verify all endpoints are alive before running tests. Parallel checks, configurable timeouts, CI exit codes.

---

## Quick Start

```bash
# Check from JSON config
npx healthcheck check endpoints.json

# Check comma-separated URLs
npx healthcheck check "https://api.example.com,https://staging.example.com"

# JSON output for CI
npx healthcheck check endpoints.json --json
```

Exits with code 1 if any endpoint is unhealthy — blocks test execution.

---

## CI Integration

```yaml
- name: Verify services are up
  run: npx healthcheck check endpoints.json
  # Fails fast if staging is down — no point running E2E tests
```

---

## Config Format

```json
[
  { "url": "https://api.example.com/health", "name": "API" },
  { "url": "https://staging.example.com", "name": "Staging", "expectedStatus": 200 },
  { "url": "https://auth.example.com", "name": "Auth", "timeout": 5000 }
]
```

---

## Library API

```typescript
import { checkAll } from 'http-status-checker';

const report = await checkAll([
  { url: 'https://api.example.com', name: 'API' },
  { url: 'https://db.example.com:5432', name: 'DB' },
]);

if (!report.allHealthy) {
  console.log(`${report.unhealthy} services down!`);
  process.exit(1);
}
```

---

## Project Structure

```
http-status-checker/
├── src/
│   ├── core/
│   │   ├── types.ts       # Endpoint, CheckResult, HealthReport
│   │   └── checker.ts     # Parallel health checks + endpoint parser
│   ├── reporters/console.ts
│   ├── cli.ts
│   └── index.ts
├── tests/unit/
│   └── checker.test.ts    # 9 tests — healthy, unhealthy, parser
├── examples/endpoints.json
└── .github/workflows/ci.yml
```

---

## License

MIT

---

Built by [Quvantic](https://quvantic.com)
