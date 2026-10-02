"""Extract SRC-07/SRC-14 values, formulas and source references; never edit sources.
Uses the Phase 1 read-only workbook helpers. Output is deterministic and anonymous.
"""
import json
import os
import re
from extract_seed import SRC, OUT_JS, OUT_FX, load, sheet, num, norm

LABELS = {
    'TIEN THUE NHA': 'cost_rent', 'HOAN COC': 'refund', 'DIEN': 'cost_el', 'NUOC': 'cost_wa',
    'MANG': 'cost_net', 'PHI THU RAC': 'cost_garbage', 'PHI MOI TRUONG': 'cost_env',
    'PHI BAO TRI THANG MAY': 'cost_elev', 'LUONG QUAN LY': 'sal_mgr', 'LUONG QUAN LY TONG': 'sal_gm',
    'LUONG TPVH': 'sal_head', 'LUONG TPVH 1': 'sal_head', 'LUONG TPVH 2': 'sal_head2',
    'LUONG PHO PHONG VAN HANH': 'sal_lead', 'LUONG TRUONG NHOM': 'sal_lead',
    'LUONG TRUONG NHOM VH THU VIEC': 'sal_lead', 'LUONG NHAN VIEN NGUON': 'sal_source',
    'LUONG NHAN SU- DAO TAO': 'sal_source', 'LUONG NVKD': 'sal_sales', 'LUONG NV PDKD': 'sal_sales',
    'LUONG VE SINH': 'sal_clean', 'LUONG KE TOAN': 'sal_acct', 'LUONG SUA CHUA': 'sal_repair',
    'LUONG BAO VE': 'sal_guard', 'THUE VA DV VP': 'office', 'PHI MARKETTING': 'marketing',
    'PHI MARKETING': 'marketing', 'SUA CHUA': 'repair', 'CAC CHI PHI KHAC': 'other',
    'MUA SAM THIET BI THEO KHAU HAO': 'cost_equip',
}

def ref(src, sh, cell):
    return '%s · %s!%s' % (src, sh, cell)

def extract_initial():
    values, formulas = load(os.path.join(SRC, 'G1.31.8.26.xlsx'))
    v, f = sheet(values, 'THU CHI BAN ĐẦU'), sheet(formulas, 'THU CHI BAN ĐẦU')
    lines = []
    for row in range(4, 58):
        label = str(v['D%d' % row].value or '').strip()
        if not label:
            continue
        # The original expense ledger contains no investor names or bank details.
        kind = 'deposit' if row == 5 else 'rent' if row == 4 else 'commission' if 23 <= row <= 37 else 'equipment' if row >= 38 else 'operating'
        lines.append(dict(id='ci_line_%d' % row, label=label, expense=num(v['E%d' % row].value), receipt=num(v['F%d' % row].value), kind=kind,
                          source_ref=ref('SRC-07', v.title, 'E%d:F%d' % (row, row)), formula=f['E%d' % row].value if f['E%d' % row].data_type == 'f' else None))
    assets = []
    av = sheet(values, 'ĐẦU TƯ BAN ĐẦU')
    for row in range(4, 12):
        label = str(av['D%d' % row].value or '').strip()
        duplicate = next(x for x in lines if norm(x['label']) == norm(label))
        assets.append(dict(id='initial_G1_%d' % row, name=label, cost=num(av['E%d' % row].value), dupOf=duplicate['id'],
                           type='pump' if row == 4 else 'washer' if row == 10 else 'decor' if row in [6, 8, 9, 11] else 'other',
                           source_ref=ref('SRC-07', av.title, 'D%d:E%d' % (row, row))))
    holders = []
    for i, col in enumerate('LMNOPQRST'):
        ratio = re.search(r'(\d+)%', str(v[col + '3'].value))
        holders.append(dict(shareholderId='sh_CHUNG' if i == 0 else 'sh_CD-%02d' % i, pct=int(ratio.group(1)), paid=num(v[col + '5'].value), source_ref=ref('SRC-07', v.title, col + '3:' + col + '6')))
    return dict(id='ci_G1', buildingId='b_G1', lines=lines, assets=assets, holders=holders, source_ref='SRC-07 · THU CHI BAN ĐẦU / ĐẦU TƯ BAN ĐẦU')

def extract_forecasts():
    values, formulas = load(os.path.join(SRC, 'bao_cao', 'BẢNG DỰ KIẾN LỢI NHUẬN CÁC THÁNG.xlsx'))
    out = []
    for v in values:
        title = v.title.strip()
        if not (re.fullmatch(r'Tháng [3-9]\.2026', title) or title in ['Tháng 1.2026', 'Tháng 8 .']):
            continue
        f = formulas[v.title]
        period = '2025-08' if title == 'Tháng 8 .' else '2026-' + re.search(r'Tháng (\d+)', title).group(1).zfill(2)
        header = str(v['D1'].value or '')
        date = re.search(r'NGÀY\s*(\d+)/(\d+)/(\d+)', header, re.I)
        draft = '%s-%02d-%02d' % (date.group(3), int(date.group(2)), int(date.group(1))) if date else period + '-22'
        scope = re.search(r'\((.*)\)', header)
        inputs = {k: num(v[k].value) for k in ['J3', 'J4', 'J5', 'J6', 'J7', 'E4', 'G4']}
        inputs['E4parts'] = [dict(amount=float(s), source_ref=ref('SRC-14', title, 'E4')) for s in re.findall(r'\d+(?:\.\d+)?', str(f['E4'].value or ''))] if f['E4'].data_type == 'f' else []
        meta = {k: dict(formula=f[k].value if f[k].data_type == 'f' else None, source_ref=ref('SRC-14', title, k)) for k in inputs if k != 'E4parts'}
        # J4 includes literal components already included in its cached total. Keep them
        # as input adjustments, separate from E3 adjustments, so they are never added twice.
        for k in ['J4', 'J5', 'J6', 'J7']:
            formula = meta[k]['formula']
            if formula:
                literals = re.findall(r'(?<![A-Z\d])([+-]?\s*\d{6,}(?:\.\d+)?)', formula.lstrip('='))
                meta[k]['adjustments'] = [dict(amount=float(s.replace(' ', '')), reason='Thành phần gõ tay trong %s, đã gồm trong giá trị ô' % k, includedInInput=True, source_ref=ref('SRC-14', title, k)) for s in literals]
        revenue_formula = str(f['E3'].value)
        constants = re.sub(r'(?:J[3-7]|E4)', '', revenue_formula).lstrip('=')
        adjustments = [dict(amount=float(s.replace(' ', '')), reason='Hằng số trong công thức nguồn E3', source_ref=ref('SRC-14', title, 'E3')) for s in re.findall(r'[+-]\s*\d+(?:\.\d+)?', constants)]
        lines, check = [], dict(rev_total=inputs['J4'] + inputs['J5'] + inputs['J6'] + inputs['J7'])
        for row in range(3, 35):
            label = str(v['F%d' % row].value or '').strip()
            if not label:
                continue
            n = norm(label)
            if n == 'TONG CHI PHI':
                check['tcp'] = num(v['G%d' % row].value)
            elif n in LABELS:
                key = LABELS[n]
                lines.append(dict(key=key, label=label, value=num(v['G%d' % row].value), formula=f['G%d' % row].value if f['G%d' % row].data_type == 'f' else None, source_ref=ref('SRC-14', title, 'F%d:G%d' % (row, row))))
            else:
                raise ValueError('Unmapped forecast label %s (%s)' % (label, title))
            dlabel = norm(v['D%d' % row].value)
            if dlabel == 'TONG LOI NHUAN': check['lnr'] = num(v['E%d' % row].value)
            if dlabel == 'LNR/DT': check['r_lnr_dt'] = num(v['E%d' % row].value)
            if dlabel == 'LNR/GV': check['r_lnr_gv'] = num(v['E%d' % row].value)
        # Result rows sometimes have no F label (ratios); inspect D separately.
        for row in range(3, 35):
            for label, key in [('TONG LOI NHUAN', 'lnr'), ('LNR/DT', 'r_lnr_dt'), ('LNR/GV', 'r_lnr_gv')]:
                if norm(v['D%d' % row].value) == label: check[key] = num(v['E%d' % row].value)
        check['rev_total'] = num(v['E3'].value)
        out.append(dict(id='fc_' + period + '_v1', period=period, version=1, draftDate=draft, scopeNote=scope.group(1) if scope else 'Phạm vi trong SRC-14', excludedBuildings=['b_G8'] if 'chưa tính G8' in header else [], source='excel_src14', form='business' if '-E4' in revenue_formula else 'cash', inputs=inputs, inputMeta=meta, lines=lines, adjustments=adjustments, excelCheck=check, source_ref=ref('SRC-14', title, 'D1:J30')))
    return out

if __name__ == '__main__':
    data = dict(initial=extract_initial(), forecasts=extract_forecasts())
    os.makedirs(OUT_FX, exist_ok=True)
    with open(os.path.join(OUT_JS, 'seed-p3.js'), 'w', encoding='utf-8') as f:
        f.write('/* Generated by scripts/seed/extract_seed_p3.py; values and formulas from SRC-07/SRC-14. */\nwindow.TH = window.TH || {}; TH.data = TH.data || {}; TH.data.p3 = ' + json.dumps(data, ensure_ascii=False, indent=2) + ';\n')
    with open(os.path.join(OUT_FX, 'phase3-source.json'), 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print('Phase 3: %d initial ledger rows, %d linked assets, %d forecasts' % (len(data['initial']['lines']), len(data['initial']['assets']), len(data['forecasts'])))
