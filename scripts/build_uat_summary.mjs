import fs from 'node:fs';
import path from 'node:path';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, PageNumber,
  Packer, Paragraph, ShadingType, Table, TableCell, TableOfContents, TableRow,
  TextRun, WidthType,
} from 'docx';
import { COMMIT, PERIOD, RUN_ROOT, SHORT_SHA, TODAY } from './uat/runtime.mjs';

const phaseFiles = [1, 2, 3].map(phase => path.join(RUN_ROOT, `phase-${phase}`, 'manifest.json'));
for (const file of phaseFiles) if (!fs.existsSync(file)) throw new Error(`Thiếu manifest: ${file}`);
const phases = phaseFiles.map(file => JSON.parse(fs.readFileSync(file, 'utf8')));
const milestones = phases.flatMap(item => item.milestones || item.steps || []);
const smoke = phases.flatMap(item => item.qa?.smoke || []);
const regressions = phases.flatMap(item => item.regression || []);
const failed = milestones.filter(item => item.status !== 'PASS');
const qaPass = milestones.length === 71 && !failed.length && phases.every(item => item.qa?.status === 'PASS') && smoke.every(item => item.status === 'PASS') && regressions.every(item => item.status === 'PASS');

const summary = {
  generatedAt: new Date().toISOString(), branch: 'uat/develop-3phase-20260918', commit: COMMIT,
  baseline: `origin/develop@${COMMIT}`, date: TODAY, period: PERIOD,
  status: qaPass ? 'PASS' : 'FAIL', total: milestones.length, pass: milestones.length - failed.length, fail: failed.length,
  phases: phases.map(item => ({ phase: item.phase, status: item.qa?.status || 'FAIL', total: (item.milestones || item.steps || []).length, pass: (item.milestones || item.steps || []).filter(step => step.status === 'PASS').length, phaseFlags: item.phaseFlags, manifest: path.relative(RUN_ROOT, phaseFiles[Number(item.phase.slice(1)) - 1]).replaceAll('\\', '/') })),
  smoke, regressions,
  businessConfirmations: [{ id: 'OI-07', status: 'NEEDS BUSINESS CONFIRMATION', decision: 'Không tự bù trừ công nợ vào tiền cọc.', conclusion: 'PASS theo mockup hiện tại; không kết luận production-ready.' }],
  simulations: ['Zalo', 'OCR', 'Ngân hàng/VietQR'],
};
fs.writeFileSync(path.join(RUN_ROOT, 'summary.json'), JSON.stringify(summary, null, 2), 'utf8');

const issueLines = [
  '# UAT issues, decisions and simulation limits', '',
  `- Baseline: \`origin/develop@${COMMIT}\``,
  `- Run status: **${summary.status}** (${summary.pass}/${summary.total})`, '',
  '## Fixed in UAT branch', '',
  '- Refund deduction rows now move to `refunded` with the parent refund record and render “Đã hoàn”.',
  '- Phase 1 F05.4 targets the exact demo receivable row and asserts the remaining balance.',
  '- Phase 1 F10.4 and Phase 2/P3 CSV exports verify filename, header, row count and SHA-256.', '',
  '## Needs business confirmation', '',
  '- **OI-07 — NEEDS BUSINESS CONFIRMATION:** retain “do not automatically offset receivables against deposit”. PASS reflects the current mockup rule only.', '',
  '## Simulation limits', '',
  '- Zalo send/retry, OCR extraction and bank/VietQR integration are mock simulations. Their PASS status does not certify a production integration.', '',
  '## Milestone failures', '',
  ...(failed.length ? failed.map(item => `- ${item.phase} ${item.milestone || item.id}: ${item.error || item.actual || 'FAIL'}`) : ['- None.']),
];
fs.writeFileSync(path.join(RUN_ROOT, 'issues.md'), issueLines.join('\n'), 'utf8');

function cell(value, options = {}) { return new TableCell({ width: { size: options.width, type: WidthType.DXA }, shading: options.fill ? { fill: options.fill, type: ShadingType.CLEAR } : undefined, children: [new Paragraph({ children: [new TextRun({ text: String(value ?? ''), bold: !!options.bold, color: options.color || '334155', size: 18 })] })] }); }
function table(rows, widths) { return new Table({ width: { size: widths.reduce((sum, value) => sum + value, 0), type: WidthType.DXA }, columnWidths: widths, borders: Object.fromEntries(['top', 'bottom', 'left', 'right', 'insideH', 'insideV'].map(key => [key, { style: BorderStyle.SINGLE, size: 3, color: 'D7DDE3' }])), rows: rows.map((row, rowIndex) => new TableRow({ children: row.map((value, index) => cell(value, { width: widths[index], fill: rowIndex === 0 ? '16324F' : undefined, color: rowIndex === 0 ? 'FFFFFF' : undefined, bold: rowIndex === 0 })) })) }); }
function p(value = '', options = {}) { return new Paragraph({ alignment: options.align, spacing: { after: options.after ?? 100, line: 260 }, children: [new TextRun({ text: String(value), bold: !!options.bold, size: options.size || 20, color: options.color || '3F4A54' })] }); }
function h(value, level = HeadingLevel.HEADING_1) { return new Paragraph({ heading: level, children: [new TextRun({ text: value, bold: true })] }); }

const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'TIMEHOUSE | UAT 3 PHASE SUMMARY', bold: true, color: '1769AA', size: 16 })] })] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'Develop UAT · Trang ', size: 16 }), PageNumber.CURRENT] })] });
const phaseRows = [['Phase', 'Flags', 'Mốc', 'PASS', 'Trạng thái'], ...summary.phases.map(item => [item.phase, JSON.stringify(item.phaseFlags), item.total, item.pass, item.status])];
const traceRows = [['Liên phase', 'Minh chứng', 'Kết quả'], ...smoke.map(item => [item.id, item.detail, item.status])];
const children = [
  new Paragraph({ spacing: { before: 900, after: 120 }, children: [new TextRun({ text: 'TIMEHOUSE', bold: true, size: 28, color: '1769AA' })] }),
  new Paragraph({ spacing: { before: 500, after: 120 }, children: [new TextRun({ text: 'UAT 3 PHASE · SUMMARY', bold: true, size: 34, color: '16324F' })] }),
  p(`Kết quả: ${summary.status} · ${summary.pass}/${summary.total} mốc · develop ${SHORT_SHA}`, { size: 24, color: summary.status === 'PASS' ? '15803D' : 'B91C1C', bold: true, after: 260 }),
  table([['Thông tin', 'Giá trị'], ['Baseline', summary.baseline], ['Ngày/kỳ nghiệp vụ', `${TODAY} · ${PERIOD}`], ['Viewport', '1440×1080'], ['Nhánh UAT', summary.branch], ['Phạm vi', 'Phase 1: 36 · Phase 2: 20 · Phase 3: 15 · tổng 71']], [2300, 6700]),
  h('Mục lục'), new TableOfContents('Mục lục', { hyperlink: true, headingStyleRange: '1-3' }),
  h('Kết quả theo phase'), table(phaseRows, [1300, 2800, 1200, 1200, 1800]),
  h('Traceability liên phase'), table(traceRows, [2600, 5200, 1400]),
  h('Regression bổ sung'), table([['Flow', 'Mốc', 'Kết quả'], ...regressions.map(item => [item.flow, (item.milestones || []).join(', '), item.status])], [2200, 4800, 1800]),
  h('Lỗi đã sửa'), p('1) Đồng bộ trạng thái dòng khấu trừ với hồ sơ hoàn cọc. 2) Chụp đúng dòng công nợ demo và số dư sau thu một phần. 3) Kiểm tra nội dung CSV cùng checksum.'),
  h('Vấn đề cần khách hàng xác nhận'), p('OI-07 — NEEDS BUSINESS CONFIRMATION: không tự bù trừ công nợ vào cọc. Kết luận chỉ là PASS theo mockup hiện tại.'),
  h('Giới hạn mô phỏng'), p('Zalo, OCR và ngân hàng/VietQR là mô phỏng. Không diễn giải kết quả UAT thành chứng nhận tích hợp production.'),
  h('Kết luận mức sẵn sàng'), p(summary.status === 'PASS' ? '71/71 mốc và smoke test liên phase PASS. Sẵn sàng review theo phạm vi mockup; chưa production-ready cho các tích hợp mô phỏng và OI-07 chưa chốt.' : `Chưa đạt điều kiện bàn giao: ${failed.length} mốc FAIL hoặc thiếu evidence. Xem issues.md và manifest từng phase.`),
];
const doc = new Document({ sections: [{ properties: { page: { margin: { top: 850, bottom: 800, left: 900, right: 900 } } }, headers: header, footers: footer, children }] });
const docx = path.join(RUN_ROOT, '00_TimeHouse_UAT_3_Phase_Summary.docx'); fs.writeFileSync(docx, await Packer.toBuffer(doc));
console.log(JSON.stringify({ root: RUN_ROOT, summary: path.join(RUN_ROOT, 'summary.json'), issues: path.join(RUN_ROOT, 'issues.md'), docx, status: summary.status }, null, 2));
if (summary.status !== 'PASS') process.exitCode = 1;

