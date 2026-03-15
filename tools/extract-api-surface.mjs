#!/usr/bin/env node
// extract-api-surface.mjs — Deterministic API surface extractor for the Midnight Wallet SDK
//
// Parses TypeScript source files from upstream/midnight-wallet/packages/*/src/index.ts
// to discover all exported symbols and their kinds. No build step required.
//
// Usage:
//   node tools/extract-api-surface.mjs --json     > state/api-surface.json
//   node tools/extract-api-surface.mjs --markdown  > state/api-surface.md
//   node tools/extract-api-surface.mjs --diff state/api-surface.json   (exit 1 if changed)

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';

const UPSTREAM_DIR = process.env.UPSTREAM_DIR || resolve('upstream/midnight-wallet');
const PACKAGES_DIR = join(UPSTREAM_DIR, 'packages');

// Only extract from publishable packages (not private)
function getPublishablePackages() {
  const packages = [];
  for (const name of readdirSync(PACKAGES_DIR).sort()) {
    const pkgPath = join(PACKAGES_DIR, name, 'package.json');
    if (!existsSync(pkgPath)) continue;
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'));
    if (pkg.private) continue;
    packages.push({ name, npmName: pkg.name, version: pkg.version, exports: pkg.exports || {} });
  }
  return packages;
}

// Resolve a package.json exports entry to a source file path
function resolveExportToSource(pkgDir, exportEntry) {
  // exports["."] = { types: "./dist/index.d.ts", import: "./dist/index.js" }
  // We want the source: src/index.ts (replace dist/ with src/, .js/.d.ts with .ts)
  let target;
  if (typeof exportEntry === 'string') {
    target = exportEntry;
  } else if (exportEntry.types) {
    target = exportEntry.types;
  } else if (exportEntry.import) {
    target = exportEntry.import;
  } else {
    return null;
  }

  // Convert dist path to src path
  const srcPath = target
    .replace(/^\.\/dist\//, './src/')
    .replace(/\.d\.ts$/, '.ts')
    .replace(/\.js$/, '.ts');

  const fullPath = join(pkgDir, srcPath);
  if (existsSync(fullPath)) return fullPath;

  // Try index.ts in directory
  const indexPath = join(pkgDir, srcPath.replace(/\.ts$/, '/index.ts'));
  if (existsSync(indexPath)) return indexPath;

  return null;
}

// Parse a TypeScript source file for exported symbols
function parseExports(filePath) {
  if (!existsSync(filePath)) return [];
  const source = readFileSync(filePath, 'utf-8');
  const dir = dirname(filePath);
  const exports = [];

  for (const line of source.split('\n')) {
    const trimmed = line.trim();

    // export type { Foo, Bar } from './module';
    // export { type Foo, Bar } from './module';
    // export { Foo, Bar } from './module';
    const reExportMatch = trimmed.match(
      /^export\s+(type\s+)?\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/
    );
    if (reExportMatch) {
      const allType = !!reExportMatch[1];
      const names = reExportMatch[2];
      const fromModule = reExportMatch[3];

      for (const part of names.split(',')) {
        const cleaned = part.trim();
        if (!cleaned) continue;

        // Handle "type Foo" within braces
        const typePrefix = cleaned.match(/^type\s+(.+)/);
        const symbolName = typePrefix ? typePrefix[1].trim() : cleaned;

        // Handle "Foo as Bar"
        const asMatch = symbolName.match(/^(\S+)\s+as\s+(\S+)/);
        const exportedName = asMatch ? asMatch[2] : symbolName;
        const originalName = asMatch ? asMatch[1] : symbolName;

        const isType = allType || !!typePrefix;

        // Try to resolve the kind from the source module
        const kind = isType
          ? resolveKindFromModule(dir, fromModule, originalName) || 'type'
          : resolveKindFromModule(dir, fromModule, originalName) || 'value';

        exports.push({ name: exportedName, kind });
      }
      continue;
    }

    // export * as Namespace from './module';  — namespace re-export
    const starAsMatch = trimmed.match(/^export\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/);
    if (starAsMatch) {
      exports.push({ name: starAsMatch[1], kind: 'namespace' });
      continue;
    }

    // export * from './module';  — resolve one level
    const starMatch = trimmed.match(/^export\s+\*\s+from\s+['"]([^'"]+)['"]/);
    if (starMatch) {
      const modPath = resolveModulePath(dir, starMatch[1]);
      if (modPath) {
        const subExports = parseExports(modPath);
        exports.push(...subExports);
      }
      continue;
    }

    // export type Foo = ...
    const typeAliasMatch = trimmed.match(/^export\s+type\s+(\w+)/);
    if (typeAliasMatch) {
      exports.push({ name: typeAliasMatch[1], kind: 'type' });
      continue;
    }

    // export interface Foo
    const interfaceMatch = trimmed.match(/^export\s+interface\s+(\w+)/);
    if (interfaceMatch) {
      exports.push({ name: interfaceMatch[1], kind: 'interface' });
      continue;
    }

    // export class Foo
    const classMatch = trimmed.match(/^export\s+class\s+(\w+)/);
    if (classMatch) {
      exports.push({ name: classMatch[1], kind: 'class' });
      continue;
    }

    // export const foo / export let foo / export var foo
    const constMatch = trimmed.match(/^export\s+(?:const|let|var)\s+(\w+)/);
    if (constMatch) {
      exports.push({ name: constMatch[1], kind: 'const' });
      continue;
    }

    // export function foo
    const funcMatch = trimmed.match(/^export\s+function\s+(\w+)/);
    if (funcMatch) {
      exports.push({ name: funcMatch[1], kind: 'function' });
      continue;
    }

    // export enum Foo
    const enumMatch = trimmed.match(/^export\s+enum\s+(\w+)/);
    if (enumMatch) {
      exports.push({ name: enumMatch[1], kind: 'enum' });
      continue;
    }

    // export namespace Foo
    const nsMatch = trimmed.match(/^export\s+namespace\s+(\w+)/);
    if (nsMatch) {
      exports.push({ name: nsMatch[1], kind: 'namespace' });
      continue;
    }
  }

  return exports;
}

// Resolve a relative module path to an actual .ts file
function resolveModulePath(dir, modulePath) {
  // Strip .js extension (TypeScript source uses .js in imports but files are .ts)
  const stripped = modulePath.replace(/\.js$/, '');

  // Try direct .ts
  const direct = join(dir, stripped + '.ts');
  if (existsSync(direct)) return direct;

  // Try index.ts in directory
  const index = join(dir, stripped, 'index.ts');
  if (existsSync(index)) return index;

  // Try as-is (already has extension)
  const asIs = join(dir, modulePath);
  if (existsSync(asIs)) return asIs;

  // Try original path + .ts (no stripping)
  const withTs = join(dir, modulePath + '.ts');
  if (existsSync(withTs)) return withTs;

  return null;
}

// Try to determine the kind of a symbol from its source module
function resolveKindFromModule(dir, modulePath, symbolName) {
  const modPath = resolveModulePath(dir, modulePath);
  if (!modPath) return null;

  const source = readFileSync(modPath, 'utf-8');

  // Check for various declaration patterns
  if (new RegExp(`(?:export\\s+)?interface\\s+${symbolName}\\b`).test(source)) return 'interface';
  if (new RegExp(`(?:export\\s+)?type\\s+${symbolName}\\b`).test(source)) return 'type';
  if (new RegExp(`(?:export\\s+)?class\\s+${symbolName}\\b`).test(source)) return 'class';
  if (new RegExp(`(?:export\\s+)?enum\\s+${symbolName}\\b`).test(source)) return 'enum';
  if (new RegExp(`(?:export\\s+)?function\\s+${symbolName}\\b`).test(source)) return 'function';
  if (new RegExp(`(?:export\\s+)?const\\s+${symbolName}\\b`).test(source)) return 'const';
  if (new RegExp(`(?:export\\s+)?namespace\\s+${symbolName}\\b`).test(source)) return 'namespace';

  return null;
}

// Extract member-level detail for interfaces and types
function extractMembers(filePath, symbolName) {
  if (!existsSync(filePath)) return [];
  const source = readFileSync(filePath, 'utf-8');
  const members = [];

  // Find interface/type body — simplified heuristic
  const ifaceRegex = new RegExp(
    `(?:export\\s+)?interface\\s+${symbolName}[^{]*\\{([\\s\\S]*?)^\\}`,
    'm'
  );
  const match = source.match(ifaceRegex);
  if (match) {
    const body = match[1];
    for (const line of body.split('\n')) {
      const memberMatch = line.trim().match(/^(?:readonly\s+)?(\w+)(\??)\s*[:(]/);
      if (memberMatch) {
        const isMethod = line.includes('(');
        members.push({
          name: memberMatch[1],
          optional: !!memberMatch[2],
          kind: isMethod ? 'method' : 'property',
        });
      }
    }
  }

  return members;
}

// Main extraction
function extractAll() {
  const packages = getPublishablePackages();
  const result = { extracted_at: new Date().toISOString(), packages: [] };

  for (const pkg of packages) {
    const pkgDir = join(PACKAGES_DIR, pkg.name);
    const pkgResult = {
      name: pkg.name,
      npm_name: pkg.npmName,
      version: pkg.version,
      entry_points: [],
    };

    // Process each export entry
    for (const [exportPath, exportEntry] of Object.entries(pkg.exports)) {
      const srcFile = resolveExportToSource(pkgDir, exportEntry);
      if (!srcFile) continue;

      const symbols = parseExports(srcFile);

      // Deduplicate
      const seen = new Set();
      const deduped = [];
      for (const sym of symbols) {
        if (seen.has(sym.name)) continue;
        seen.add(sym.name);

        // Extract members for interfaces
        if (sym.kind === 'interface') {
          const members = extractMembers(srcFile, sym.name);
          // Also check re-exported source files
          if (members.length === 0) {
            const source = readFileSync(srcFile, 'utf-8');
            const fromMatch = source.match(
              new RegExp(`${sym.name}[^'"]*from\\s+['"]([^'"]+)['"]`)
            );
            if (fromMatch) {
              const modPath = resolveModulePath(dirname(srcFile), fromMatch[1]);
              if (modPath) {
                const deepMembers = extractMembers(modPath, sym.name);
                sym.members = deepMembers;
              }
            }
          } else {
            sym.members = members;
          }
        }

        deduped.push(sym);
      }

      pkgResult.entry_points.push({
        path: exportPath,
        source_file: srcFile.replace(UPSTREAM_DIR + '/', ''),
        symbols: deduped,
      });
    }

    result.packages.push(pkgResult);
  }

  return result;
}

// Output modes
function toMarkdown(data) {
  const lines = [
    '# Wallet SDK — API Surface',
    '',
    `*Extracted: ${data.extracted_at}*`,
    '',
  ];

  let totalSymbols = 0;
  let totalMembers = 0;

  for (const pkg of data.packages) {
    lines.push(`## ${pkg.npm_name} (${pkg.version})`);
    lines.push('');

    for (const ep of pkg.entry_points) {
      if (ep.path !== '.') {
        lines.push(`### Sub-export: \`${ep.path}\``);
        lines.push('');
      }

      lines.push('| Symbol | Kind | Members |');
      lines.push('|--------|------|---------|');

      for (const sym of ep.symbols) {
        totalSymbols++;
        const memberCount = sym.members ? sym.members.length : 0;
        totalMembers += memberCount;
        const memberStr = memberCount > 0
          ? sym.members.map(m => `${m.name}${m.optional ? '?' : ''}`).join(', ')
          : '—';
        lines.push(`| \`${sym.name}\` | ${sym.kind} | ${memberStr} |`);
      }

      lines.push('');
    }
  }

  lines.push('---');
  lines.push(`**Total: ${totalSymbols} symbols, ${totalMembers} members across ${data.packages.length} packages**`);

  return lines.join('\n');
}

function doDiff(data, oldPath) {
  const oldData = JSON.parse(readFileSync(oldPath, 'utf-8'));

  const oldSymbols = new Map();
  for (const pkg of oldData.packages) {
    for (const ep of pkg.entry_points) {
      for (const sym of ep.symbols) {
        oldSymbols.set(`${pkg.npm_name}/${ep.path}/${sym.name}`, sym);
      }
    }
  }

  const newSymbols = new Map();
  for (const pkg of data.packages) {
    for (const ep of pkg.entry_points) {
      for (const sym of ep.symbols) {
        newSymbols.set(`${pkg.npm_name}/${ep.path}/${sym.name}`, sym);
      }
    }
  }

  const added = [];
  const removed = [];

  for (const key of newSymbols.keys()) {
    if (!oldSymbols.has(key)) added.push(key);
  }
  for (const key of oldSymbols.keys()) {
    if (!newSymbols.has(key)) removed.push(key);
  }

  if (added.length === 0 && removed.length === 0) {
    console.log('No API surface changes detected.');
    process.exit(0);
  }

  if (added.length > 0) {
    console.log('ADDED:');
    for (const a of added) console.log(`  + ${a}`);
  }
  if (removed.length > 0) {
    console.log('REMOVED:');
    for (const r of removed) console.log(`  - ${r}`);
  }
  console.log(`\n${added.length} added, ${removed.length} removed`);
  process.exit(1);
}

// CLI
const args = process.argv.slice(2);
const data = extractAll();

if (args.includes('--json')) {
  console.log(JSON.stringify(data, null, 2));
} else if (args.includes('--markdown')) {
  console.log(toMarkdown(data));
} else if (args.includes('--diff')) {
  const oldPath = args[args.indexOf('--diff') + 1];
  if (!oldPath) {
    console.error('Usage: --diff <old-api-surface.json>');
    process.exit(2);
  }
  doDiff(data, oldPath);
} else {
  // Default: print summary
  let total = 0;
  for (const pkg of data.packages) {
    for (const ep of pkg.entry_points) {
      total += ep.symbols.length;
      console.log(`${pkg.npm_name}${ep.path === '.' ? '' : '/' + ep.path}: ${ep.symbols.length} exports`);
    }
  }
  console.log(`\nTotal: ${total} symbols across ${data.packages.length} packages`);
}
