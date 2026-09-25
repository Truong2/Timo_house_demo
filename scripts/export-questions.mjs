import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { QUESTIONS } from '../app/core/decisions.mjs';

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(repo, 'docs_timonouse', 'outputs', 'TimoHouse_Open_Questions_v1.0.md');
const rows = QUESTIONS.map((q) => `| ${q.id} | ${q.title} | ${q.current} | ${q.source} | ${q.param || '—'} |`);
await writeFile(out, `# Sổ câu hỏi mở TimoHouse v1.0\n\nCác quyết định hiện tại là tạm thời để demo và đối soát Seed.\n\n| Mã | Vấn đề | App đang làm | Nguồn | Tham số |\n|---|---|---|---|---|\n${rows.join('\n')}\n`, 'utf8');
console.log(out);
