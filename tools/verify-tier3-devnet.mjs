#!/usr/bin/env node
// verify-tier3-devnet.mjs — Runs Tier 3 devnet tests

import { readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/app/workspace';
const TEST_DIR = join(WORKSPACE_DIR, 'ts-tests');

const allResults = [];

const tests = readdirSync(TEST_DIR)
  .filter(f => f.startsWith('tier3-') && f.endsWith('.mjs'))
  .sort();

for (const test of tests) {
  const testPath = join(TEST_DIR, test);
  try {
    const output = execSync(`node ${testPath}`, {
      encoding: 'utf-8',
      timeout: 120000,
      cwd: WORKSPACE_DIR,
      env: { ...process.env },
    });

    const jsonMatch = output.match(/\{[\s\S]*"results"[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      allResults.push(...data.results);
    }
  } catch (err) {
    const output = err.stdout || '';
    const jsonMatch = output.match(/\{[\s\S]*"results"[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      allResults.push(...data.results);
    } else {
      allResults.push({
        name: `${test}/error`,
        pass: false,
        detail: (err.message || '').slice(0, 200),
      });
    }
  }
}

console.log(JSON.stringify({ results: allResults }));
