#!/usr/bin/env node
// verify-tier1-typecheck.mjs — Runs TypeScript type-checker and reports results

import { execSync } from 'child_process';
import { readdirSync } from 'fs';
import { join } from 'path';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/app/workspace';
const TEST_DIR = join(WORKSPACE_DIR, 'ts-tests');

const results = [];

// List all test-*.ts files
const testFiles = readdirSync(TEST_DIR)
  .filter(f => f.startsWith('test-') && f.endsWith('.ts'))
  .sort();

try {
  execSync('npx tsc --noEmit', {
    cwd: WORKSPACE_DIR,
    encoding: 'utf-8',
    timeout: 60000,
  });

  // All files pass
  for (const f of testFiles) {
    results.push({
      name: `typecheck/${f.replace(/^test-/, '').replace(/\.ts$/, '')}`,
      pass: true,
    });
  }
} catch (err) {
  const output = err.stdout || err.stderr || '';

  // Parse which files have errors
  const errorFiles = new Set();
  for (const line of output.split('\n')) {
    const match = line.match(/^ts-tests\/(test-[^(]+\.ts)\(/);
    if (match) errorFiles.add(match[1]);
  }

  for (const f of testFiles) {
    results.push({
      name: `typecheck/${f.replace(/^test-/, '').replace(/\.ts$/, '')}`,
      pass: !errorFiles.has(f),
      detail: errorFiles.has(f) ? 'TypeScript compilation errors' : undefined,
    });
  }
}

console.log(JSON.stringify({ results }));
