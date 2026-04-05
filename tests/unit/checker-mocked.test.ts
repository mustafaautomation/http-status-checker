import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkEndpoint, checkAll } from '../../src/core/checker';

const mockFetch = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterEach(() => {
  vi.restoreAllMocks();
});

function mockResponse(status: number): Response {
  return {
    status,
    ok: status >= 200 && status < 300,
    statusText: 'OK',
    headers: new Headers(),
    redirected: false,
    type: 'basic',
    url: '',
    clone: () => ({}) as Response,
    body: null,
    bodyUsed: false,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
    blob: () => Promise.resolve(new Blob()),
    formData: () => Promise.resolve(new FormData()),
    bytes: () => Promise.resolve(new Uint8Array()),
  } as Response;
}

describe('checkEndpoint — mocked success', () => {
  it('should return ok for 200 response', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200));

    const result = await checkEndpoint({ url: 'https://api.example.com/health' });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(200);
    expect(result.error).toBeUndefined();
    expect(result.duration).toBeGreaterThanOrEqual(0);
  });

  it('should fail for non-expected status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(503));

    const result = await checkEndpoint({
      url: 'https://api.example.com/health',
      expectedStatus: 200,
    });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(503);
    expect(result.error).toContain('Expected 200');
    expect(result.error).toContain('503');
  });

  it('should match custom expected status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(301));

    const result = await checkEndpoint({
      url: 'https://example.com',
      expectedStatus: 301,
    });
    expect(result.ok).toBe(true);
    expect(result.status).toBe(301);
  });

  it('should use specified HTTP method', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200));

    await checkEndpoint({ url: 'https://api.example.com', method: 'HEAD' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com',
      expect.objectContaining({ method: 'HEAD' }),
    );
  });

  it('should pass custom headers', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200));

    await checkEndpoint({
      url: 'https://api.example.com',
      headers: { Authorization: 'Bearer token123' },
    });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.example.com',
      expect.objectContaining({
        headers: { Authorization: 'Bearer token123' },
      }),
    );
  });

  it('should handle network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    const result = await checkEndpoint({ url: 'https://down.example.com' });
    expect(result.ok).toBe(false);
    expect(result.status).toBe(0);
    expect(result.error).toContain('ECONNREFUSED');
  });

  it('should handle timeout error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('The operation was aborted'));

    const result = await checkEndpoint({ url: 'https://slow.example.com', timeout: 100 });
    expect(result.ok).toBe(false);
    expect(result.error).toContain('aborted');
  });
});

describe('checkAll — mocked', () => {
  it('should report all healthy when all 200', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200));
    mockFetch.mockResolvedValueOnce(mockResponse(200));
    mockFetch.mockResolvedValueOnce(mockResponse(200));

    const report = await checkAll([
      { url: 'https://api.example.com', name: 'API' },
      { url: 'https://web.example.com', name: 'Web' },
      { url: 'https://auth.example.com', name: 'Auth' },
    ]);

    expect(report.allHealthy).toBe(true);
    expect(report.healthy).toBe(3);
    expect(report.unhealthy).toBe(0);
    expect(report.total).toBe(3);
  });

  it('should report mixed health status', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200));
    mockFetch.mockResolvedValueOnce(mockResponse(503));
    mockFetch.mockRejectedValueOnce(new Error('timeout'));

    const report = await checkAll([
      { url: 'https://api.example.com', name: 'API' },
      { url: 'https://db.example.com', name: 'DB' },
      { url: 'https://cache.example.com', name: 'Cache' },
    ]);

    expect(report.allHealthy).toBe(false);
    expect(report.healthy).toBe(1);
    expect(report.unhealthy).toBe(2);
  });

  it('should handle empty endpoint list', async () => {
    const report = await checkAll([]);
    expect(report.total).toBe(0);
    expect(report.allHealthy).toBe(true);
    expect(report.results).toHaveLength(0);
  });

  it('should preserve endpoint names in results', async () => {
    mockFetch.mockResolvedValueOnce(mockResponse(200));
    mockFetch.mockResolvedValueOnce(mockResponse(200));

    const report = await checkAll([
      { url: 'https://a.com', name: 'Service A' },
      { url: 'https://b.com', name: 'Service B' },
    ]);

    expect(report.results[0].name).toBe('Service A');
    expect(report.results[1].name).toBe('Service B');
  });
});
