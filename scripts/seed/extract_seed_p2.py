"""Sinh dữ liệu đối chiếu Phase 2 từ file Excel của khách (chạy một lần, kết quả được commit). Không đụng seed Phase 1.

    python -X utf8 scripts/seed/extract_seed_p2.py

Nguồn (docs_timonouse/):
  SRC-09 Hoa hồng năm 2025-2026 (1).xlsx, sheet HOA HỒNG THÁNG 8.26     → dòng hoa hồng T8 (UI-22, nghiệm thu Σ thành tiền)
  SRC-07 G1.31.8.26.xlsx, sheet BÁO CÁO THÁNG 8                         → tỷ lệ cổ đông G1 + bảng chia Excel (UI-31/32)
  SRC-15 bao_cao/âm dương điện nước tháng 6/7.xlsx                      → âm dương theo tòa: nước T6, điện T6, điện T7 (UI-43, chế độ "như Excel")
  SRC-16 bao_cao/sổ sửa chữa tháng 8(AutoRecovered).xlsx                → sổ sửa chữa 2 thợ T8, lương thợ, ứng chi, điểm lấy sơn (UI-47/44)

Ẩn danh: tên cổ đông, người nhận hoa hồng là cá nhân, SĐT/STK không lấy. Tên thợ → khóa nhân viên sẵn có trong seed-master (như Phase 1).
Giữ nguyên: mã tòa/phòng, số tiền, tỷ lệ — là số liệu nghiệm thu.
Đầu ra: mockup/js/data/seed-p2.js và tests/fixtures/*-p2.json (file sinh, không sửa tay).
"""
import json
import os
import re
import sys
import unicodedata

sys.path.insert(0, os.path.dirname(__file__))
from extract_seed import SRC, OUT_JS, OUT_FX, ROOT, log, load, sheet, num, r2, iso, norm, pseudo, ekey  # noqa: E402

BIZ = re.compile(r'\d|HOME|HOUSE|LAND|CITY|MOITHUE|TNR', re.I)
_rcp = {}


def recipient(raw):
    """Người nhận hoa hồng (cột L 'Team'): đối tác doanh nghiệp giữ tên; cá nhân → mã CTV ẩn danh. '(LEAD)' = khách từ nhóm lead công ty."""
    s = re.sub(r'\s+', ' ', str(raw or '')).strip()
    if not s:
        return None
    lead = '(LEAD)' in s.upper()
    base = re.sub(r'\(LEAD\)', '', s, flags=re.I).strip()
    if BIZ.search(base):
        return dict(name=base.upper(), kind='partner', lead=lead)
    if base not in _rcp:
        _rcp[base] = 'CTV ' + pseudo(base, 'ctv')
    return dict(name=_rcp[base], kind='person', lead=lead)


def term_of(g):
    s = str(g or '').strip().lower()
    if not s or s == 'none':
        return None
    if 'cọc' in s:
        return 'forfeit'
    m = re.search(r'(\d+)', s)
    return int(m.group(1)) if m else None


FORFEIT = re.compile(r'^=\s*(\d+)\s*-\s*\(\s*(\d+)\s*/\s*(\d+)\s*(?:\*\s*(\d+))?\s*\)\s*$')


def commission(sheet_name='HOA HỒNG THÁNG 8.26', period='2026-08', status_col=1, ql_col=2, last_row=259):
    """Đọc một sheet hoa hồng tháng. T8: A trạng thái, B quản lý; từ T9: A trống, B trạng thái, C quản lý. Cột D… giống nhau."""
    path = os.path.join(SRC, 'Hoa hồng năm 2025-2026 (1).xlsx')
    wv, wf = load(path)
    sv, sf = sheet(wv, sheet_name), sheet(wf, sheet_name)
    rows, cur, group = [], None, 0
    # tên quản lý có thể xuất hiện trong ghi chú → che
    qls = sorted({unicodedata.normalize('NFC', str(sv.cell(r, ql_col).value).strip()) for r in range(4, last_row + 1) if sv.cell(r, ql_col).value}, key=len, reverse=True)
    for r in range(4, last_row + 1):
        room, F = sv.cell(r, 4).value, sv.cell(r, 6).value
        if room is None and F is None:
            cur = None
            continue
        rc = recipient(sv.cell(r, 12).value)
        if rc:
            cur, group = rc, group + 1
        ff = str(sf.cell(r, 6).value or '')
        m = FORFEIT.match(ff.replace(' ', ''))
        forfeit = dict(deposit=int(m.group(1)), rent=int(m.group(2)), dim=int(m.group(3)), days=int(m.group(4) or 1)) if m else None
        Hraw = sv.cell(r, 8).value
        H = num(str(Hraw).replace('%', '')) / 100 if isinstance(Hraw, str) and '%' in Hraw else num(Hraw)
        I = sv.cell(r, 9).value
        note = unicodedata.normalize('NFC', str(sv.cell(r, 11).value or '').strip())
        for q in qls:
            note = re.sub(r'(?<!\w)' + re.escape(q) + r'(?!\w)', 'QL', note, flags=re.I)
        share = 3 if re.search(r'trùng\s*3', note, re.I) else 2 if note.lower().startswith('trùng') else 1
        code = str(room or '').strip().upper()
        b = sv.cell(r, 5).value
        rows.append(dict(row=r, status=str(sv.cell(r, status_col).value or '').strip().lower() or None, room=code, b=str(b or '').strip().upper(),
                         F=r2(num(F)), forfeit=forfeit, termRaw=str(sv.cell(r, 7).value or '').strip() or None, term=term_of(sv.cell(r, 7).value),
                         H=round(H, 6), I=r2(I) if isinstance(I, (int, float)) else None, Iformula=str(sf.cell(r, 9).value or '') if isinstance(I, (int, float)) else None,
                         note=re.sub(r'0\d{9}', '', note)[:80], share=share, recipient=cur and cur['name'], recipientKind=cur and cur['kind'],
                         lead=bool(cur and cur['lead']), group=group, paid='tt' in str(sv.cell(r, 13).value or '').lower()))
    total = r2(sum(x['I'] or 0 for x in rows))
    log(f'  hoa hồng {sheet_name}: {len(rows)} dòng · có thành tiền {sum(1 for x in rows if x["I"] is not None)} · Σ = {total:,.2f} (Excel I3 = {num(sv.cell(3, 9).value):,.2f})')
    out = dict(period=period, sheet=sheet_name, src='SRC-09', excelTotal=r2(num(sv.cell(3, 9).value)), rows=rows)
    if period != '2026-08':
        out['excelTotalFormula'] = str(sf.cell(3, 9).value or '')  # T8 giữ nguyên cấu trúc file sinh cũ
    return out


def safe_pseudo(name, scope):
    t = norm(name).split()
    real = set(t[1:] if len(t) > 1 else t)  # họ trùng không lộ danh tính; tên đệm / tên thì không được trùng
    i = 0
    while True:
        p = pseudo(name if i == 0 else f'{name}#{i}', scope)
        if not (set(norm(p).split()) & real):
            return p
        i += 1


def shares():
    path = os.path.join(SRC, 'G1.31.8.26.xlsx')
    wv, wf = load(path)
    sv = sheet(wv, 'BÁO CÁO THÁNG 8')
    holders = []
    for r in range(3, 12):
        name = str(sv.cell(r, 6).value or '').strip()
        if not name:
            continue
        common = norm(name) == 'CHUNG'
        holders.append(dict(code='CHUNG' if common else 'CD-' + str(len(holders)).zfill(2), name='Quỹ chung công ty' if common else safe_pseudo(name, 'codong'),
                            common=common, pct=num(sv.cell(r, 7).value), excel=dict(H=num(sv.cell(r, 8).value), I=num(sv.cell(r, 9).value), J=num(sv.cell(r, 10).value), M=num(sv.cell(r, 13).value))))
    C = {k: num(sv.cell(r, 3).value) for k, r in dict(C2=2, C22=22, C34=34, C72=72, C73=73, C74=74, C78=78, C80=80).items()}
    log(f'  cổ đông G1: {len(holders)} dòng · Σ% = {sum(h["pct"] for h in holders)} · C22 {C["C22"]:,.0f} · C73 {C["C73"]:,.2f} · C74 {C["C74"]:,.4f}')
    return dict(building='G1', period='2026-08', src='SRC-07', sheet='BÁO CÁO THÁNG 8', holders=holders, excel=C,
                totals=dict(H=num(sv.cell(13, 8).value), I=num(sv.cell(13, 9).value), J=num(sv.cell(13, 10).value), M=num(sv.cell(13, 13).value)))


AD_COLS = ['b', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M']


def amduong():
    out = {}
    for fn, name, key, kind in [('âm dương điện nước tháng 7.xlsx', 'THÁNG 7.2026 điện', '2026-07', 'electric'),
                                ('âm dương điện nước tháng 6.xlsx', 'THÁNG 6.2026 điện', '2026-06', 'electric'),
                                ('âm dương điện nước tháng 6.xlsx', 'THÁNG 6.2026 nước', '2026-06', 'water')]:
        wv, _ = load(os.path.join(SRC, 'bao_cao', fn))
        sv = sheet(wv, name)
        rows, total = [], None
        for r in range(3, sv.max_row + 1):
            b = sv.cell(r, 1).value
            vals = [sv.cell(r, c).value for c in range(2, 14)]
            if not b and any(isinstance(v, (int, float)) for v in vals):
                total = {k: r2(num(v)) for k, v in zip(AD_COLS[1:], vals)}
                break
            if not b:
                continue
            rows.append(dict({'b': str(b).strip().upper()}, **{k: (r2(num(v)) if isinstance(v, (int, float)) else None) for k, v in zip(AD_COLS[1:], vals)}))
        out.setdefault(key, {})[kind] = dict(sheet=name, src='SRC-15', rows=rows, total=total)
        log(f'  âm dương {key} {kind}: {len(rows)} tòa · thu {total["K"]:,.0f} · chi {total["L"]:,.0f} · thu−chi {total["M"]:,.0f}')
    return out


def repairs():
    path = os.path.join(SRC, 'bao_cao', 'sổ sửa chữa tháng 8(AutoRecovered).xlsx')
    wv, wf = load(path)
    workers = []
    # sheet mang tên thật của thợ → ghi ra "Thợ 1 / Thợ 2"; mã NV ẩn danh cùng hàm với seed Phase 1
    for sh, key, pay_col, label in [('A Điệp 8.26', ekey('TRAN XUAN DIEP'), 2, 'Thợ 1 8.26'), ('A Ước 8.26', ekey('NGUYEN VAN UOC'), 10, 'Thợ 2 8.26')]:
        sv = sheet(wv, sh)
        rows = []
        for r in range(4, sv.max_row + 1):
            d, b, desc = sv.cell(r, 1).value, sv.cell(r, 2).value, sv.cell(r, 4).value
            lab, mat = sv.cell(r, 5).value, sv.cell(r, 6).value
            if not (d or b or desc) and lab is None and mat is None:
                continue
            room = sv.cell(r, 3).value
            rows.append(dict(row=r, date=iso(d), b=str(b or '').strip().upper() or None, room=str(int(room) if isinstance(room, float) else room or '').strip() or None,
                             desc=str(desc or '').strip()[:120], labor=num(lab), material=num(mat), paint=str(sv.cell(r, 7).value or '').strip() or None,
                             note=str(sv.cell(r, 8).value or '').strip()[:80] or None, flag=str(sv.cell(r, 9).value or '').strip()[:40] or None))
        lw = sheet(wv, 'LƯƠNG THÁNG 8')
        c = pay_col
        # khối lương: nhãn ở cột c-1 (A hoặc I), số ở cột c (B hoặc J) – dòng 14..29 (thợ 1) / 15..29 (thợ 2)
        blk = {}
        for r in range(13, 31):
            lab_ = norm(lw.cell(r, c - 1).value)
            if lab_:
                blk[lab_] = num(lw.cell(r, c).value) if lab_ != 'TONG' else num(lw.cell(r, c + 2).value)
        excel = dict(labor=num(sv.cell(3, 5).value), material=num(sv.cell(3, 6).value), base=blk.get('LUONG CUNG'), seniority=blk.get('LUONG THAM NIEN'),
                     lunch=blk.get('HO TRO AN TRUA'), pay=blk.get('TONG'), advance=blk.get('UNG CHI'), spent=blk.get('CHI THUC TE'), settle=blk.get('TONG HT BACK LAI'))
        workers.append(dict(empKey=key, sheet=label, rows=rows, excel=excel))
        log(f'  sổ sửa chữa {sh}: {len(rows)} dòng · công {excel["labor"]:,.0f} · vật tư {excel["material"]:,.0f} · lương {excel["pay"]:,.0f} · HT back {excel["settle"]:,.0f}')
    ps = sheet(wv, 'Sheet4')
    paint = []
    for r in range(3, ps.max_row + 1):
        room, q, note = ps.cell(r, 1).value, ps.cell(r, 2).value, ps.cell(r, 3).value
        if room:
            paint.append(dict(rooms=str(room).strip(), qty=num(q), note=str(note or '').strip()))
    stock = [dict(point=str(ps.cell(r, 9).value).strip(), qty=num(re.sub(r'\D', '', str(ps.cell(r, 10).value or '')))) for r in range(3, 12) if ps.cell(r, 9).value]
    return dict(period='2026-08', src='SRC-16', window=['2026-07-26', '2026-08-25'], workers=workers, paint=dict(uses=paint, stock=stock))


# Tên người còn sót trong ghi chú / điểm lấy sơn / sheet (audit 30/09) → che khi ghi file
PEOPLE_MASK = [(r'(?i)\bnhà\s+huy[eềể]n\b', 'nhà QL'), (r'(?i)\ba\s+kiên\b', 'a thợ'), (r'Hà Thành', 'CTV khác'), (r'A Điệp', 'Thợ 1'), (r'A Ước', 'Thợ 2')]


def mask_people(txt):
    for pat, rep in PEOPLE_MASK:
        txt = re.sub(pat, rep, txt)
    return txt


def main():
    log('Phase 2 – dữ liệu đối chiếu')
    data = dict(generatedFrom='scripts/seed/extract_seed_p2.py', commission=commission(), shares=shares(), amduong=amduong(), repairs=repairs())
    data = json.loads(mask_people(json.dumps(data, ensure_ascii=False)))
    path = os.path.join(OUT_JS, 'seed-p2.js')
    txt = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    with open(path, 'w', encoding='utf-8', newline='\n') as f:
        f.write('/* FILE SINH TỰ ĐỘNG bởi scripts/seed/extract_seed_p2.py – không sửa tay. Dữ liệu đã ẩn danh. */\n')
        f.write(f'window.TH = window.TH || {{}}; TH.data = TH.data || {{}}; TH.data.p2 = {txt};\n')
    log(f'  → {os.path.relpath(path, ROOT)} ({len(txt) / 1024:.0f} KB)')
    for name, obj in [('commission-2026-08-p2.json', data['commission']), ('shares-g1-2026-08-p2.json', data['shares']),
                      ('amduong-2026-06-07-p2.json', data['amduong']), ('repairs-2026-08-p2.json', data['repairs'])]:
        with open(os.path.join(OUT_FX, name), 'w', encoding='utf-8', newline='\n') as f:
            json.dump(obj, f, ensure_ascii=False, indent=0)


if __name__ == '__main__':
    main()
