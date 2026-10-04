"""Read September workbook evidence without changing the historical seed or exposing names."""
from pathlib import Path
import hashlib
import json
import re
import openpyxl

ROOT = Path(__file__).resolve().parents[2]
files = []
for path in sorted((ROOT / 'docs_timonouse').rglob('*.xlsx')):
    wb = openpyxl.load_workbook(path, data_only=True, read_only=True)
    files.append({'file': str(path.relative_to(ROOT)).replace('\\', '/'), 'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'sheets': wb.sheetnames})
    print(path.name + ': ' + ', '.join(wb.sheetnames))
    if path.name.startswith('Hoa hồng'):
        sheet = wb['HOA HỒNG THÁNG 9.26']
        rows = list(sheet.iter_rows(values_only=True))
        print('SEPTEMBER COMMISSION HEADERS', json.dumps(rows[:3], ensure_ascii=False, default=str))
        selected = []
        for n, row in enumerate(rows[3:], 4):
            vals = list(row) + [None] * 15
            room = str(vals[3] or '').strip().upper()
            if not re.match(r'^\d+.*[TSG]\d', room):
                continue
            selected.append({'row': n, 'room': room, 'building': str(vals[4] or '').strip().upper(), 'price': vals[5], 'term': str(vals[6] or ''), 'rate': vals[7], 'amount': vals[8], 'paidMarker': str(vals[12] or '')})
        print('SEPTEMBER COMMISSION NUMERIC SAMPLE', json.dumps(selected[:6], ensure_ascii=False, default=str))
        commissions = {'file': str(path.relative_to(ROOT)).replace('\\', '/'), 'sheet': sheet.title, 'totalCell': 'I3', 'total': rows[2][8], 'rows': selected}
    wb.close()
out = ROOT / 'scripts' / 'seed' / 'september-source.json'
out.write_text(json.dumps({'period': '2026-09', 'files': files, 'commissions': commissions}, ensure_ascii=False, indent=2, default=str) + '\n', encoding='utf-8')
print('Wrote', out.relative_to(ROOT))
