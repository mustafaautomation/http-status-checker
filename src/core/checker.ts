import { Endpoint, CheckResult, HealthReport } from './types';

export async function checkEndpoint(endpoint: Endpoint): Promise<CheckResult> {
  const name = endpoint.name || endpoint.url;
  const method = endpoint.method || 'GET';
  const timeout = endpoint.timeout || 10000;
  const expectedStatus = endpoint.expectedStatus || 200;
  const start = Date.now();

  try {
    const res = await fetch(endpoint.url, {
      method,
      headers: endpoint.headers,
      signal: AbortSignal.timeout(timeout),
      redirect: 'follow',
    });

    const duration = Date.now() - start;
    const ok = res.status === expectedStatus;

    return {
      url: endpoint.url,
      name,
      status: res.status,
      ok,
      duration,
      error: ok ? undefined : `Expected ${expectedStatus}, got ${res.status}`,
    };
  } catch (err) {
    return {
      url: endpoint.url,
      name,
      status: 0,
      ok: false,
      duration: Date.now() - start,
      error: (err as Error).message,
    };
  }
}

export async function checkAll(endpoints: Endpoint[]): Promise<HealthReport> {
  const start = Date.now();
  const results = await Promise.all(endpoints.map(checkEndpoint));

  const healthy = results.filter((r) => r.ok).length;

  return {
    timestamp: new Date().toISOString(),
    total: results.length,
    healthy,
    unhealthy: results.length - healthy,
    results,
    allHealthy: healthy === results.length,
    totalDuration: Date.now() - start,
  };
}

export function parseEndpoints(input: string): Endpoint[] {
  // Try JSON first
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed)) {
      return parsed.map((e) => (typeof e === 'string' ? { url: e } : (e as Endpoint)));
    }
  } catch {
    // Not JSON — treat as URL list (one per line or comma-separated)
  }

  return input
    .split(/[\n,]/)
    .map((u) => u.trim())
    .filter((u) => u.startsWith('http'))
    .map((url) => ({ url }));
}
