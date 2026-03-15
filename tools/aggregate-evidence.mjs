#!/usr/bin/env node
// aggregate-evidence.mjs — Runs all verification scripts and collects evidence
//
// Each verify-*.mjs script in tools/ outputs JSON with:
//   { results: [{ name: string, pass: boolean, detail?: string }] }
//
// This aggregator normalizes and writes docs/evidence.json

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const TOOLS_DIR = process.env.TOOLS_DIR || '/app/tools';
const DOCS_DIR = process.env.DOCS_DIR || '/app/docs';
const STATE_DIR = process.env.STATE_DIR || '/app/state';

function runVerifyScripts(tier) {
  const pattern = tier ? `verify-${tier}-` : 'verify-';
  const scripts = readdirSync(TOOLS_DIR)
    .filter(f => f.startsWith(pattern) && f.endsWith('.mjs'))
    .sort();

  const allResults = [];

  for (const script of scripts) {
    const scriptPath = join(TOOLS_DIR, script);
    const tierMatch = script.match(/verify-(tier\d+)-(.+)\.mjs/);
    const tierName = tierMatch ? tierMatch[1] : 'tier1';
    const category = tierMatch ? tierMatch[2] : script.replace(/^verify-/, '').replace(/\.mjs$/, '');

    console.log(`  Running ${script}...`);
    try {
      const output = execSync(`node ${scriptPath}`, {
        encoding: 'utf-8',
        timeout: 120000,
        cwd: process.cwd(),
        env: { ...process.env },
      });

      // Try to parse JSON output
      const jsonMatch = output.match(/\{[\s\S]*"results"[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        for (const r of data.results) {
          allResults.push({
            name: r.name,
            status: r.pass ? 'pass' : 'fail',
            tier: tierName,
            category,
            detail: r.detail || null,
          });
        }
      }
    } catch (err) {
      console.error(`  ERROR in ${script}: ${err.message}`);
      allResults.push({
        name: `${category}/error`,
        status: 'error',
        tier: tierName,
        category,
        detail: err.message.slice(0, 200),
      });
    }
  }

  return allResults;
}

const results = runVerifyScripts();

const summary = {
  generated_at: new Date().toISOString(),
  total: results.length,
  passing: results.filter(r => r.status === 'pass').length,
  failing: results.filter(r => r.status === 'fail').length,
  errors: results.filter(r => r.status === 'error').length,
  results,
};

writeFileSync(join(DOCS_DIR, 'evidence.json'), JSON.stringify(summary, null, 2));
console.log(`\nEvidence: ${summary.passing}/${summary.total} passing`);
