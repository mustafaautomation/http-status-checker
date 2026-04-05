export interface Endpoint {
  url: string;
  name?: string;
  method?: 'GET' | 'POST' | 'HEAD';
  expectedStatus?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

export interface CheckResult {
  url: string;
  name: string;
  status: number;
  ok: boolean;
  duration: number;
  error?: string;
}

export interface HealthReport {
  timestamp: string;
  total: number;
  healthy: number;
  unhealthy: number;
  results: CheckResult[];
  allHealthy: boolean;
  totalDuration: number;
}
