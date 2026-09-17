import fs from 'fs'; import vm from 'vm';
const ctx = { window: {}, console, document: undefined }; ctx.window.TH = {}; vm.createContext(ctx);
for (const f of ['mockup/js/core/format.js', 'mockup/js/core/ocr-parser.js']) vm.runInContext(fs.readFileSync(f, 'utf8'), ctx);
const P = ctx.window.TH.ocrParser;
const file = process.argv[2]; let text = fs.readFileSync(file, 'utf8').replace(/=== PAGE \d+ ===/g, '\f');
const r = P.parse(text);
for (const f of r.fields) console.log((f.confirmed ? '  ' : '!!') + ' ' + f.key.padEnd(16) + String(f.confidence).padEnd(5) + JSON.stringify(f.value));
console.log('assets:', r.assets.length); r.assets.forEach(a => console.log('   ', a.kind[0], a.name.padEnd(26), a.qty.padEnd(6), a.condition, a.desc || ''));
console.log('meta', r.meta);
