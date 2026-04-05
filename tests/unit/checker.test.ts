import { describe, it, expect } from 'vitest';
import { checkEndpoint, checkAll, parseEndpoints } from '../../src/core/checker';

describe('checkEndpoint', () => {
  it('should handle connection errors gracefully', async () => {
    const result = await checkEndpoint({ url: 'http://localhost:1', timeout: 2000 });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(result.error).toBeTruthy();
    expect(result.duration).toBeGreaterThan(0);
  });

  it('should use custom name', async () => {
    const result = await checkEndpoint({ url: 'http://localhost:1', name: 'My API', timeout: 1000 });
    expect(result.name).toBe('My API');
  });

  it('should default name to URL', async () => {
    const result = await checkEndpoint({ url: 'http://localhost:1', timeout: 1000 });
    expect(result.name).toBe('http://localhost:1');
  });
});

describe('checkAll', () => {
  it('should check multiple endpoints in parallel', async () => {
    const report = await checkAll([
      { url: 'http://localhost:1', timeout: 1000 },
      { url: 'http://localhost:2', timeout: 1000 },
    ]);
    expect(report.total).toBe(2);
    expect(report.healthy).toBe(0);
    expect(report.unhealthy).toBe(2);
    expect(report.allHealthy).toBe(false);
  });

  it('should compute total duration', async () => {
    const report = await checkAll([{ url: 'http://localhost:1', timeout: 500 }]);
    expect(report.totalDuration).toBeGreaterThanOrEqual(0);
  });

  it('should include timestamp', async () => {
    const report = await checkAll([]);
    expect(report.timestamp).toBeTruthy();
  });
});

describe('parseEndpoints', () => {
  it('should parse JSON array of objects', () => {
    const endpoints = parseEndpoints(
      JSON.stringify([{ url: 'https://a.com', name: 'A' }, { url: 'https://b.com' }]),
    );
    expect(endpoints).toHaveLength(2);
    expect(endpoints[0].name).toBe('A');
  });

  it('should parse JSON array of strings', () => {
    const endpoints = parseEndpoints(JSON.stringify(['https://a.com', 'https://b.com']));
    expect(endpoints).toHaveLength(2);
  });

  it('should parse comma-separated URLs', () => {
    const endpoints = parseEndpoints('https://a.com, https://b.com');
    expect(endpoints).toHaveLength(2);
  });

  it('should parse newline-separated URLs', () => {
    const endpoints = parseEndpoints('https://a.com\nhttps://b.com');
    expect(endpoints).toHaveLength(2);
  });

  it('should skip non-URL lines', () => {
    const endpoints = parseEndpoints('https://a.com\nnot a url\nhttps://b.com');
    expect(endpoints).toHaveLength(2);
  });
});
