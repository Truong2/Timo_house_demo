// Gate: mọi màn trong ui-imagegen-v1/_source/screens phải sinh ra HTML trùng từng byte với bản đã commit ở _source/html.
// Chạy trước và sau mỗi lần sửa app/ui/shell.mjs để chắc ảnh -verified không bị đổi. Không chạy render.mjs (nó ghi đè PNG).
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'docs_timonouse/outputs/ui-imagegen-v1/_source');

export async function checkShellParity({ quiet = false } = {}) {
  const files = (await readdir(path.join(src, 'screens'))).filter((f) => f.endsWith('.mjs')).sort();
  const failed = [];
  for (const f of files) {
    const { file, html } = (await import(pathToFileURL(path.join(src, 'screens', f)).href)).default;
    const expected = await readFile(path.join(src, 'html', file.replace(/\.png$/, '.html')), 'utf8');
    if (html === expected) { if (!quiet) console.log(`✓ ${f}`); continue; }
    let i = 0;
    while (i < html.length && html[i] === expected[i]) i++;
    failed.push(f);
    console.error(`✕ ${f} lệch tại ký tự ${i}:\n  có   : ${JSON.stringify(html.slice(i, i + 80))}\n  cần  : ${JSON.stringify(expected.slice(i, i + 80))}`);
  }
  return { total: files.length, failed };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { total, failed } = await checkShellParity();
  console.log(failed.length ? `Shell parity: ${failed.length}/${total} màn lệch` : `Shell parity: ${total}/${total} màn khớp`);
  process.exit(failed.length ? 1 : 0);
}
