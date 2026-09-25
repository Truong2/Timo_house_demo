// Dev server tĩnh cho app/ (mặc định) hoặc dist/ (--dist). ES module cần phục vụ qua http, không chạy được qua file://.
// Dùng: node scripts/serve.mjs [--dist] [--port 8765]
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.doc': 'application/msword', '.pdf': 'application/pdf',
};

export function startServer({ root = 'app', port = 8765, host = '127.0.0.1', quiet = false } = {}) {
  const base = path.resolve(repo, root);
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://x');
      let rel = decodeURIComponent(url.pathname);
      if (rel.endsWith('/')) rel += 'index.html';
      const file = path.normalize(path.join(base, rel));
      if (!file.startsWith(base)) { res.writeHead(403).end('Forbidden'); return; }
      let target = file;
      try { if (!(await stat(target)).isFile()) throw new Error(); } catch { target = path.join(base, 'index.html'); }
      const body = await readFile(target);
      res.writeHead(200, { 'Content-Type': MIME[path.extname(target).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch (e) {
      res.writeHead(500).end(String(e));
    }
  });
  return new Promise((resolve) => server.listen(port, host, () => {
    const p = server.address().port;
    if (!quiet) console.log(`TimoHouse mockup: http://localhost:${p}/  (phục vụ ${path.relative(repo, base) || '.'}/)`);
    resolve({ server, port: p, url: `http://localhost:${p}/` });
  }));
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  const i = args.indexOf('--port');
  startServer({ root: args.includes('--dist') ? 'dist' : 'app', port: i >= 0 ? Number(args[i + 1]) : Number(process.env.PORT || 8765), host: args.includes('--host') ? '0.0.0.0' : '127.0.0.1' });
}
