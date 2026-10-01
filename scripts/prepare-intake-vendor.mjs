/* Browser-only document readers, served from the same origin (no contract upload). */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = path.join(root, 'mockup/vendor/intake');
fs.mkdirSync(out, { recursive: true });
for (const [src, dest] of [
  ['pdfjs-dist/build', 'pdf'], ['pdfjs-dist/standard_fonts', 'standard_fonts'], ['pdfjs-dist/cmaps', 'cmaps'],
  ['tesseract.js/dist', 'tesseract'], ['tesseract.js-core', 'core'],
]) fs.cpSync(path.join(root, 'node_modules', src), path.join(out, dest), { recursive: true });
fs.mkdirSync(path.join(out, 'lang'), { recursive: true });
for (const lang of ['vie', 'eng']) fs.copyFileSync(path.join(root, 'node_modules', '@tesseract.js-data', lang, '4.0.0_best_int', lang + '.traineddata.gz'), path.join(out, 'lang', lang + '.traineddata.gz'));
const sheet = path.join(out, 'xlsx.full.min.js');
const sheetHash='cc015130aa8521e7f088f88898eba949ccdcbfb38df0bd129b44b7273c3a6f41';
if (!fs.existsSync(sheet)) {
  const r = await fetch('https://cdn.sheetjs.com/xlsx-0.20.3/package/dist/xlsx.full.min.js');
  if (!r.ok) throw new Error('Cannot download official SheetJS CE: ' + r.status);
  fs.writeFileSync(sheet, Buffer.from(await r.arrayBuffer()));
}
if(crypto.createHash('sha256').update(fs.readFileSync(sheet)).digest('hex')!==sheetHash)throw new Error('SheetJS CE checksum mismatch');
console.log('Document readers ready in mockup/vendor/intake');
