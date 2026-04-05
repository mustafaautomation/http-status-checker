import { HealthReport } from '../core/types';

const R = '\x1b[0m',
  B = '\x1b[1m',
  D = '\x1b[2m';
const RED = '\x1b[31m',
  GRN = '\x1b[32m',
  CYN = '\x1b[36m';

export function printReport(report: HealthReport): void {
  console.log();
  console.log(`${B}${CYN}Health Check${R}  ${D}${report.timestamp}${R}`);
  console.log();

  for (const r of report.results) {
    const icon = r.ok ? `${GRN}✓` : `${RED}✗`;
    const status = r.ok ? `${GRN}${r.status}` : `${RED}${r.status || 'ERR'}`;
    console.log(`  ${icon}${R} ${r.name}  ${status}${R}  ${D}${r.duration}ms${R}`);
    if (r.error) console.log(`    ${RED}${r.error}${R}`);
  }

  console.log();
  const statusText = report.allHealthy
    ? `${GRN}ALL HEALTHY`
    : `${RED}${report.unhealthy} UNHEALTHY`;
  console.log(
    `  ${B}${statusText}${R}  ${D}(${report.healthy}/${report.total} up, ${report.totalDuration}ms)${R}`,
  );
  console.log();
}
