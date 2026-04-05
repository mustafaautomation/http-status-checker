## Real-World Use Cases

### 1. Pre-Test Health Gate
```yaml
- name: Verify staging is up
  run: npx healthcheck check endpoints.json
  # Fails fast if any service is down — saves time
```

### 2. Multi-Service Smoke
Check API, auth, DB, cache are all healthy before running E2E suite.
