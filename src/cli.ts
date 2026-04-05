#!/usr/bin/env node
import { Command } from 'commander';
import fs from 'fs';
import { checkAll, parseEndpoints } from './core/checker';
import { printReport } from './reporters/console';
import { Endpoint } from './core/types';

const program = new Command();
program.name('healthcheck').description('Check endpoint health before test runs').version('1.0.0');

program
  .command('check')
  .description('Check endpoints from a config file or URL list')
  .argument('<input>', 'JSON config file or comma-separated URLs')
  .option('--json', 'Output as JSON')
  .option('--timeout <ms>', 'Request timeout', '10000')
  .action(async (input: string, options) => {
    let endpoints: Endpoint[];

    if (fs.existsSync(input)) {
      endpoints = parseEndpoints(fs.readFileSync(input, 'utf-8'));
    } else {
      endpoints = parseEndpoints(input);
    }

    if (endpoints.length === 0) {
      console.error('No valid endpoints found');
      process.exit(1);
    }

    const timeout = parseInt(options.timeout);
    endpoints = endpoints.map((e) => ({ ...e, timeout: e.timeout || timeout }));

    const report = await checkAll(endpoints);

    if (options.json) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      printReport(report);
    }

    if (!report.allHealthy) process.exit(1);
  });

program.parse();
