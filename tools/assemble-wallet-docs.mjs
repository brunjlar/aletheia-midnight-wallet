#!/usr/bin/env node
// assemble-wallet-docs.mjs — Assembles the wallet SDK reference document
//
// Reads:
//   docs/wallet-sdk-outline.md     — document skeleton
//   state/api-surface.json         — extracted API surface
//   docs/evidence.json             — verification evidence
//
// Writes:
//   docs/wallet-sdk-reference.md   — assembled document

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const DOCS_DIR = process.env.DOCS_DIR || '/app/docs';
const STATE_DIR = process.env.STATE_DIR || '/app/state';
const UPSTREAM_DIR = process.env.UPSTREAM_DIR || '/app/upstream/midnight-wallet';

// Load inputs
const outline = readFileSync(join(DOCS_DIR, 'wallet-sdk-outline.md'), 'utf-8');
const api = JSON.parse(readFileSync(join(STATE_DIR, 'api-surface.json'), 'utf-8'));

let evidence = { results: [], total: 0, passing: 0 };
const evidencePath = join(DOCS_DIR, 'evidence.json');
if (existsSync(evidencePath)) {
  evidence = JSON.parse(readFileSync(evidencePath, 'utf-8'));
}

// Get upstream commit (try multiple approaches for Docker/submodule compatibility)
let upstreamCommit = 'unknown';
let upstreamCommitFull = 'unknown';
try {
  upstreamCommitFull = execSync(`git -C ${UPSTREAM_DIR} rev-parse HEAD`, { encoding: 'utf-8' }).trim();
  upstreamCommit = upstreamCommitFull.slice(0, 12);
} catch {
  // Inside Docker, the submodule .git ref may not resolve — try reading HEAD directly
  try {
    const headRef = readFileSync(join(UPSTREAM_DIR, '.git'), 'utf-8').trim();
    const gitDir = headRef.replace('gitdir: ', '');
    const headPath = join(UPSTREAM_DIR, gitDir, 'HEAD');
    if (existsSync(headPath)) {
      upstreamCommitFull = readFileSync(headPath, 'utf-8').trim();
      upstreamCommit = upstreamCommitFull.slice(0, 12);
    }
  } catch {}
  // Also try state/snapshot.yaml
  try {
    const snap = readFileSync(join(STATE_DIR, 'snapshot.yaml'), 'utf-8');
    const commitMatch = snap.match(/commit:\s+(\w+)/);
    if (commitMatch) {
      upstreamCommitFull = commitMatch[1];
      upstreamCommit = upstreamCommitFull.slice(0, 12);
    }
  } catch {}
}

// Build API surface markdown section
function buildApiSurface() {
  const lines = [];
  let totalSymbols = 0;
  let totalMembers = 0;

  for (const pkg of api.packages) {
    lines.push(`### ${pkg.npm_name} (${pkg.version})`);
    lines.push('');

    for (const ep of pkg.entry_points) {
      if (ep.path !== '.') {
        lines.push(`#### Sub-export: \`${ep.path}\``);
        lines.push('');
      }

      lines.push('| Symbol | Kind | Members |');
      lines.push('|--------|------|---------|');

      for (const sym of ep.symbols) {
        totalSymbols++;
        const memberCount = sym.members ? sym.members.length : 0;
        totalMembers += memberCount;
        const memberStr = memberCount > 0
          ? sym.members.map(m => `\`${m.name}${m.optional ? '?' : ''}\``).join(', ')
          : '—';
        lines.push(`| \`${sym.name}\` | ${sym.kind} | ${memberStr} |`);
      }

      lines.push('');
    }
  }

  lines.push(`**Total: ${totalSymbols} symbols, ${totalMembers} members across ${api.packages.length} packages**`);
  return lines.join('\n');
}

// Build evidence summary
function buildEvidenceSummary() {
  const tiers = {};
  for (const r of evidence.results) {
    const tier = r.tier || 'tier1';
    if (!tiers[tier]) tiers[tier] = { pass: 0, fail: 0, error: 0 };
    tiers[tier][r.status]++;
  }

  const lines = [
    '| Tier | Passing | Failing | Errors | Total |',
    '|------|---------|---------|--------|-------|',
  ];

  for (const [tier, counts] of Object.entries(tiers).sort()) {
    const total = counts.pass + counts.fail + counts.error;
    lines.push(`| ${tier} | ${counts.pass} | ${counts.fail} | ${counts.error} | ${total} |`);
  }

  const total = evidence.total || 0;
  const passing = evidence.passing || 0;
  lines.push(`| **Total** | **${passing}** | **${total - passing}** | | **${total}** |`);

  return lines.join('\n');
}

// Build evidence tables for specific patterns
function buildEvidenceTable(pattern) {
  const matching = evidence.results.filter(r => {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    return regex.test(r.name) || regex.test(r.category || '');
  });

  if (matching.length === 0) return '*No evidence collected yet.*';

  const lines = [
    '| Test | Status | Detail |',
    '|------|--------|--------|',
  ];

  for (const r of matching) {
    const status = r.status === 'pass' ? 'PASS' : r.status === 'fail' ? 'FAIL' : 'ERROR';
    const detail = r.detail ? r.detail.slice(0, 80) : '—';
    lines.push(`| ${r.name} | ${status} | ${detail} |`);
  }

  return lines.join('\n');
}

// Build GraphQL types appendix
function buildGraphqlTypes() {
  const indexerPkg = api.packages.find(p => p.npm_name === '@midnight-ntwrk/wallet-sdk-indexer-client');
  if (!indexerPkg) return '*Indexer client package not found.*';

  const lines = ['| Symbol | Kind |', '|--------|------|'];
  for (const ep of indexerPkg.entry_points) {
    for (const sym of ep.symbols) {
      lines.push(`| \`${sym.name}\` | ${sym.kind} |`);
    }
  }
  return lines.join('\n');
}

// Build evidence index
function buildEvidenceIndex() {
  if (evidence.results.length === 0) return '*No evidence collected yet.*';

  const byCategory = {};
  for (const r of evidence.results) {
    const cat = r.category || r.tier || 'uncategorized';
    if (!byCategory[cat]) byCategory[cat] = [];
    byCategory[cat].push(r);
  }

  const lines = [];
  for (const [cat, results] of Object.entries(byCategory).sort()) {
    lines.push(`### ${cat}`);
    lines.push('');
    lines.push('| Test | Tier | Status |');
    lines.push('|------|------|--------|');
    for (const r of results) {
      lines.push(`| ${r.name} | ${r.tier || '?'} | ${r.status} |`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

// Assemble
let doc = outline;

// Replace metadata placeholders
doc = doc.replace(/UPSTREAM_COMMIT/g, upstreamCommitFull);
doc = doc.replace(/BUILD_TIMESTAMP/g, new Date().toISOString());

// Inject API surface
doc = doc.replace('(api-surface)', buildApiSurface());

// Inject evidence summary
doc = doc.replace('(evidence-summary)', buildEvidenceSummary());

// Inject evidence tables
doc = doc.replace(/\(evidence: ([^)]+)\)/g, (_, pattern) => buildEvidenceTable(pattern));

// Inject GraphQL types
doc = doc.replace('(graphql-types)', buildGraphqlTypes());

// Inject evidence index
doc = doc.replace('(evidence-index)', buildEvidenceIndex());

// Write output
const outPath = join(DOCS_DIR, 'wallet-sdk-reference.md');
writeFileSync(outPath, doc);

const lines = doc.split('\n').length;
console.log(`Assembled ${outPath}: ${lines} lines`);
console.log(`  API surface: ${api.packages.length} packages`);
console.log(`  Evidence: ${evidence.passing || 0}/${evidence.total || 0} passing`);
console.log(`  Upstream: ${upstreamCommit}`);
