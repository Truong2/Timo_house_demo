// Kiểm tra nhanh không cần trình duyệt: cú pháp mọi .mjs · import được module thuần · shell parity · test domain.
import { readdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkShellParity } from './check-shell-parity.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
let failed = 0;

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.name.endsWith('.mjs')) out.push(p);
  }
  return out;
}

const files = [...await walk(path.join(repo, 'app')), ...await walk(path.join(repo, 'scripts')), ...await walk(path.join(repo, 'tests'))];
for (const f of files) {
  try { execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' }); } catch (e) { failed++; console.error(`✕ cú pháp ${path.relative(repo, f)}\n${e.stderr}`); }
}
console.log(`Cú pháp: ${files.length - failed}/${files.length} file`);

for (const m of ['app/core/seed.mjs', 'app/core/auth.mjs', 'app/core/params.mjs', 'app/core/decisions.mjs',
  'app/core/period.mjs', 'app/core/domain/session.mjs', 'app/core/domain/workflow.mjs',
  'app/core/domain/extraction.mjs', 'app/core/domain/headLeases.mjs', 'app/core/domain/buildings.mjs', 'app/core/domain/rooms.mjs']) {
  try { await import(pathToFileURL(path.join(repo, m)).href); } catch (e) { failed++; console.error(`✕ import ${m}: ${e.message}`); }
}

const parity = await checkShellParity({ quiet: true });
console.log(`Shell parity: ${parity.total - parity.failed.length}/${parity.total} màn khớp`);
failed += parity.failed.length;

try {
  const out = execFileSync(process.execPath, ['--test', 'tests/domain/*.test.mjs'], { cwd: repo, stdio: 'pipe' }).toString();
  console.log(`Test domain: ${out.match(/# pass (\d+)/)?.[1]} pass, ${out.match(/# fail (\d+)/)?.[1]} fail`);
} catch (e) {
  failed++;
  console.error(`✕ Test domain lỗi\n${e.stdout}`);
}

process.exit(failed ? 1 : 0);
