import { describe, it, expect, vi } from 'vitest';
import { printReport } from '../../src/reporters/console';
import { HealthReport } from '../../src/core/types';

describe('Console reporter', () => {
  it('should print all-healthy report', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const report: HealthReport = {
      timestamp: '2026-04-06T10:00:00Z',
      total: 3,
      healthy: 3,
      unhealthy: 0,
      allHealthy: true,
      totalDuration: 250,
      results: [
        { url: 'https://api.com', name: 'API', status: 200, ok: true, duration: 80 },
        { url: 'https://web.com', name: 'Web', status: 200, ok: true, duration: 90 },
        { url: 'https://auth.com', name: 'Auth', status: 200, ok: true, duration: 80 },
      ],
    };

    printReport(report);

    const output = spy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).toContain('Health Check');
    expect(output).toContain('ALL HEALTHY');
    expect(output).toContain('3/3');
    expect(output).toContain('API');
    expect(output).toContain('200');

    spy.mockRestore();
  });

  it('should print unhealthy report with errors', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const report: HealthReport = {
      timestamp: '2026-04-06T10:00:00Z',
      total: 2,
      healthy: 1,
      unhealthy: 1,
      allHealthy: false,
      totalDuration: 500,
      results: [
        { url: 'https://api.com', name: 'API', status: 200, ok: true, duration: 80 },
        {
          url: 'https://db.com',
          name: 'Database',
          status: 0,
          ok: false,
          duration: 400,
          error: 'ECONNREFUSED',
        },
      ],
    };

    printReport(report);

    const output = spy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).toContain('1 UNHEALTHY');
    expect(output).toContain('ECONNREFUSED');
    expect(output).toContain('Database');

    spy.mockRestore();
  });

  it('should show ERR for status 0', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const report: HealthReport = {
      timestamp: '',
      total: 1,
      healthy: 0,
      unhealthy: 1,
      allHealthy: false,
      totalDuration: 100,
      results: [
        {
          url: 'https://down.com',
          name: 'Down',
          status: 0,
          ok: false,
          duration: 100,
          error: 'timeout',
        },
      ],
    };

    printReport(report);

    const output = spy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).toContain('ERR');

    spy.mockRestore();
  });

  it('should handle empty results', () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const report: HealthReport = {
      timestamp: '',
      total: 0,
      healthy: 0,
      unhealthy: 0,
      allHealthy: true,
      totalDuration: 0,
      results: [],
    };

    printReport(report);

    const output = spy.mock.calls.map((c) => c.join(' ')).join('\n');
    expect(output).toContain('ALL HEALTHY');
    expect(output).toContain('0/0');

    spy.mockRestore();
  });
});
