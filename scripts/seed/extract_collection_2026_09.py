"""Trích sheet "cập nhật thu tiền" (SRC-08, file hóa đơn tháng 9) thành fixture đối chiếu – chạy một lần, kết quả được commit.

    python -X utf8 scripts/seed/extract_collection_2026_09.py

Bảng theo tòa (cột L–V): mã tòa, quản lý, phải thu N, thực thu O, phá HĐ P/Q, tỷ lệ R/S, đã thu cộng dồn tại NGÀY M5/M10/15 (T/U/V).
Bảng theo quản lý (cột A–I). Cột W/X/Y (DT mốc) lỗi #REF! trong file nguồn nên không lấy – web tính lại.
Ẩn danh: tên quản lý → mã nhân viên ẩn danh (ekey, trùng cách sinh seed-master), không ghi tên.
Đầu ra: tests/fixtures/collection-2026-09.json
"""
import json
import os
import sys

import openpyxl

sys.path.insert(0, os.path.dirname(__file__))
from extract_seed import ROOT, SRC, ekey  # noqa: E402

FILE = 'Hoá đơn tiền nhà tháng 9 và dịch vụ tháng 9 năm 2026.xlsx'
SHEET = 'cập nhật thu tiền'


def num(v):
    return round(float(v), 2) if isinstance(v, (int, float)) else None


def main():
    wb = openpyxl.load_workbook(os.path.join(SRC, FILE), data_only=True, read_only=True)
    rows = list(wb[SHEET].iter_rows(values_only=True))
    wb.close()
    buildings, managers = [], []
    for n, r in enumerate(rows[2:], 3):
        r = list(r) + [None] * 40
        code = str(r[11] or '').strip().upper()
        if code and code != 'TỔNG':
            buildings.append(dict(row=n, building=code, managerKey=ekey(r[12]), N=num(r[13]), O=num(r[14]), P=num(r[15]), Q=num(r[16]),
                                  R=num(r[17]), S=num(r[18]), T=num(r[19]), U=num(r[20]), V=num(r[21])))
        name = str(r[0] or '').strip()
        if name and name.upper() != 'TỔNG HỆ THỐNG' and isinstance(r[1], (int, float)):
            managers.append(dict(row=n, managerKey=ekey(name), B=num(r[1]), C=num(r[2]), D=num(r[3]), E=num(r[4]), F=num(r[5]), G=num(r[6]),
                                 H=num(r[7]), I=num(r[8])))
    total = next(list(r) for r in rows[2:] if str(r[11] or '').strip().upper() == 'TỔNG')
    out = dict(source=f'SRC-08 {FILE} · sheet "{SHEET}"', period='2026-09', milestoneDays=[5, 10, 15], buildings=buildings, managers=managers,
               total=dict(N=num(total[13]), O=num(total[14]), P=num(total[15]), Q=num(total[16]), T=num(total[19]), U=num(total[20]), V=num(total[21])))
    path = os.path.join(ROOT, 'tests', 'fixtures', 'collection-2026-09.json')
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print(f'  {len(buildings)} tòa · {len(managers)} quản lý → {os.path.relpath(path, ROOT)}')
    js = os.path.join(ROOT, 'mockup', 'js', 'data', 'seed-collection-2026-09.js')
    with open(js, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* FILE SINH TỰ ĐỘNG bởi scripts/seed/extract_collection_2026_09.py – không sửa tay. Số mốc thu T/U/V theo tòa, đã ẩn danh. */\n')
        f.write('window.TH = window.TH || {}; TH.data = TH.data || {}; TH.data.collection202609 = ' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f'  → {os.path.relpath(js, ROOT)}')


if __name__ == '__main__':
    main()
