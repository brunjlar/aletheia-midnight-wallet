#!/usr/bin/env node
// verify-tier1-standalone.mjs — Runs all Tier 1 standalone execution tests
// and aggregates results into a single evidence JSON output.

import { readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const WORKSPACE_DIR = process.env.WORKSPACE_DIR || '/app/workspace';
const TEST_DIR = join(WORKSPACE_DIR, 'ts-tests');

const allResults = [];

// Find and run all tier1-*.mjs tests
const tests = readdirSync(TEST_DIR)
  .filter(f => f.startsWith('tier1-') && f.endsWith('.mjs'))
  .sort();

for (const test of tests) {
  const testPath = join(TEST_DIR, test);
  try {
    const output = execSync(`node ${testPath}`, {
      encoding: 'utf-8',
      timeout: 30000,
      cwd: WORKSPACE_DIR,
    });

    const jsonMatch = output.match(/\{[\s\S]*"results"[\s\S]*\}/);
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0]);
      allResults.push(...data.results);
    }
  } catch (err) {
    // If the test script exits non-zero but still produced JSON, parse it
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
