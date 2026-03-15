#!/usr/bin/env node
// check-coverage.mjs — Verify that all API surface symbols are covered by evidence
//
// Reads state/api-surface.json and docs/evidence.json
// Reports uncovered symbols and overall coverage percentage

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const STATE_DIR = process.env.STATE_DIR || 'state';
const DOCS_DIR = process.env.DOCS_DIR || 'docs';

const apiPath = join(STATE_DIR, 'api-surface.json');
const evidencePath = join(DOCS_DIR, 'evidence.json');
const outlinePath = join(DOCS_DIR, 'wallet-sdk-outline.md');

// Load API surface
const api = JSON.parse(readFileSync(apiPath, 'utf-8'));

// Collect all symbols
const allSymbols = [];
for (const pkg of api.packages) {
  for (const ep of pkg.entry_points) {
    for (const sym of ep.symbols) {
      allSymbols.push({
        package: pkg.npm_name,
        entryPoint: ep.path,
        name: sym.name,
        kind: sym.kind,
      });
    }
  }
}

// Load evidence if available
let evidence = { results: [] };
if (existsSync(evidencePath)) {
  evidence = JSON.parse(readFileSync(evidencePath, 'utf-8'));
}

// Check outline for symbol mentions
let outlineContent = '';
if (existsSync(outlinePath)) {
  outlineContent = readFileSync(outlinePath, 'utf-8');
}

// Build coverage map
const covered = new Set();
for (const r of evidence.results) {
  // Evidence names follow pattern: package/SymbolName-*
  const match = r.name.match(/^([^/]+)\/(\w+)/);
  if (match) {
    covered.add(match[2]); // symbol name
  }
}

// Also check outline mentions
for (const sym of allSymbols) {
  if (outlineContent.includes(`\`${sym.name}\``)) {
    covered.add(sym.name);
  }
}

// Report
const uncovered = allSymbols.filter(s => !covered.has(s.name));
const uniqueNames = new Set(allSymbols.map(s => s.name));
const coveredCount = [...uniqueNames].filter(n => covered.has(n)).length;
const totalUnique = uniqueNames.size;
const pct = totalUnique > 0 ? Math.round((coveredCount / totalUnique) * 100) : 0;

console.log(`Coverage: ${coveredCount}/${totalUnique} unique symbols (${pct}%)`);

if (uncovered.length > 0 && uncovered.length <= 50) {
  console.log('\nUncovered symbols:');
  const seen = new Set();
  for (const s of uncovered) {
    if (seen.has(s.name)) continue;
    seen.add(s.name);
    console.log(`  - ${s.package}: ${s.name} (${s.kind})`);
  }
}

if (pct < 100) {
  console.log(`\n${totalUnique - coveredCount} symbols still need coverage`);
}

// Exit with 0 even if coverage is incomplete (informational)
