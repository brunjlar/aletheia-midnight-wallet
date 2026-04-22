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
  const skipTier3 = process.env.SKIP_TIER3 === '1';
  const scripts = readdirSync(TOOLS_DIR)
    .filter(f => f.startsWith(pattern) && f.endsWith('.mjs'))
    .filter(f => !(skipTier3 && f.includes('tier3')))
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

// Capture the environment fingerprint so the produced evidence carries
// an authoritative record of versions + source pins. Conforms to
// docs/design/fingerprint-schema.md at the coordinator level.
function collectFingerprint() {
  try {
    // Script path resolution: prefer mounted /app/scripts (Docker); fall
    // back to the coordinator-relative path (host) — the collector itself
    // handles both host and --docker invocation modes internally.
    const candidates = [
      '/app/scripts/collect-fingerprint.sh',
      process.env.SCRIPTS_DIR && join(process.env.SCRIPTS_DIR, 'collect-fingerprint.sh'),
      join(process.env.REPO_ROOT || '.', 'scripts', 'collect-fingerprint.sh'),
    ].filter(Boolean);
    let script = null;
    for (const c of candidates) {
      if (existsSync(c)) { script = c; break; }
    }
    if (!script) throw new Error('collect-fingerprint.sh not found in any candidate path');
    const flag = process.env.IN_DOCKER === 'true' ? ' --docker' : '';
    const json = execSync(`bash "${script}"${flag}`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    return JSON.parse(json);
  } catch (err) {
    return {
      schema_version: 1,
      captured_at: new Date().toISOString(),
      toolchain: {},
      runtime: { method: 'fingerprint-collection-failed', error: err.message.slice(0, 200) },
      verification: {
        verified_against_expected: false,
        mismatches: null,
        expected_toolchain_file: 'state/expected-toolchain.yaml',
      },
    };
  }
}

const fingerprint = collectFingerprint();

const summary = {
  generated_at: new Date().toISOString(),
  total: results.length,
  passing: results.filter(r => r.status === 'pass').length,
  failing: results.filter(r => r.status === 'fail').length,
  errors: results.filter(r => r.status === 'error').length,
  environment_fingerprint: fingerprint,
  results,
};

writeFileSync(join(DOCS_DIR, 'evidence.json'), JSON.stringify(summary, null, 2));
console.log(`\nEvidence: ${summary.passing}/${summary.total} passing`);
const mm = fingerprint?.verification?.mismatches;
if (mm && mm.length) {
  console.log(`Environment mismatches detected (${mm.length}): see evidence.json#environment_fingerprint.verification.mismatches`);
}
