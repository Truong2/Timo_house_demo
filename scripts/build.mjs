// Build = copy app/ → dist/ (cho Netlify) + build.json + _headers. Không bundle, không transpile.
import { rm, cp, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(repo, 'dist');
await rm(dist, { recursive: true, force: true });
await cp(path.join(repo, 'app'), dist, { recursive: true });
let sha = 'unknown';
try { sha = execSync('git rev-parse --short HEAD', { cwd: repo }).toString().trim(); } catch { /* không có git */ }
await writeFile(path.join(dist, 'build.json'), JSON.stringify({ sha, builtAt: new Date().toISOString(), scope: 'SRS v1.0 FR02–FR05' }, null, 2));
await writeFile(path.join(dist, '_headers'), '/*.mjs\n  Cache-Control: no-cache\n  Content-Type: text/javascript; charset=utf-8\n/*.css\n  Cache-Control: no-cache\n');
await writeFile(path.join(dist, '_redirects'), '/*  /index.html  200\n');
console.log(`Đã build dist/ từ app/ (commit ${sha})`);
