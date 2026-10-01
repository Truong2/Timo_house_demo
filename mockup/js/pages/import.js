/* UI-37 Import: chọn loại → tải file CSV → mapping cột → kiểm tra (E25 lỗi/trùng/#REF!) → nhập dòng hợp lệ; nhập lại cùng mã nguồn không tạo trùng. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, X = TH.actions, esc = F.esc, I = TH.calc.importv;
  const SAMPLES = {
    readings: 'Mã phòng,Kỳ (YYYY-MM),Điện cũ,Điện mới,Nước cũ,Nước mới\n101T17,2026-10,6041,6230,,\n201T17,2026-10,7119,7002,,\n999T17,2026-10,100,200,,\n301T17,2026-10,#REF!,10400,,\n101T17,2026-10,6041,6230,,',
    expenses: 'Mã chứng từ,Ngày chi,Kỳ hưởng,Loại chi phí,Tòa / quỹ chung,Số tiền,Nhà cung cấp\nCP-DEMO-001,2026-09-24,2026-09,Phí thu rác,T17,300000,Công ty môi trường\nCP-DEMO-002,24/09/2026,2026-09,"Sửa chữa, thay thế, bảo trì",S43,1.450.000,Thợ ngoài\nCP-DEMO-003,2026-09-25,2026-09,Thuê & dịch vụ văn phòng,F_OFFICE,12000000,Văn phòng\nCP-DEMO-004,2026-09-25,2026-09,Điện (hóa đơn nhà cung cấp),X99,500000,EVN',
    vendorBills: 'Dịch vụ,Mã KH nhà cung cấp,Mã tòa,Kỳ hưởng,Ngày hóa đơn,Số tiền,Số hóa đơn\nĐiện,PD30•••097,,2026-09,2026-09-12,15102000,EVN-2609-G1\nĐiện,PD12•••687,,2026-09,2026-09-12,5410000,EVN-2609-G2\nĐiện,PD99•••000,,2026-09,2026-09-12,1000000,EVN-2609-X\nRác,,G1,2026-09,2026-09-15,300000,RAC-2609-G1\nThang máy,,,2026-09,2026-09-15,500000,TM-2609-01',
    commissions: 'Mã khoản,Kỳ ghi nhận,Mã phòng,Sale,Số tiền\nHH-2609-01,2026-09,501S43,Sale A,1500000\nHH-2609-02,2026-09,203G1,Sale B,2050000',
    equipment: 'Mã tòa,Tên thiết bị,Ngày mua,Nguyên giá\nG1,Máy giặt tầng 2,2026-06-10,6500000\nS43,Điều hòa P501,2026-07-02,8500000',
    staff: 'Mã NV,Họ tên,Chức danh,Ngày vào làm,SĐT,Khu vực\nNV-DEMO-1,Nguyễn Văn Mới,NVVH,2026-09-15,0912000111,Khu Cầu Giấy\nNV-0001,Trùng mã nguồn,NVVH,2026-09-15,,\nNV-DEMO-2,Sai chức danh,GIAM DOC,2026-09-15,,',
    openingDebt: 'Mã KH (lượt thuê),Số còn nợ,Kỳ gốc\n101T17A001,450000,2026-08',
    buildings: 'Mã tòa,Địa chỉ,Loại T/S/G,Khu vực,Mã NV quản lý,Số tầng,Ngày nhận vận hành\nS99,Số 1 ngõ 2 Xuân Thủy,S,Khu Cầu Giấy,NV-0003,5,2026-10-01\ns43,Trùng mã (khác hoa thường),S,Khu Cầu Giấy,NV-0003,,\nT98,Sai nhóm,S,Khu Cầu Giấy,NV-0003,,\nS97,Quản lý lạ,S,Khu Cầu Giấy,NV-9999,,\nS96,Khu vực lạ,S,Khu Lạ,NV-0003,,',
    rooms: 'Mã tòa,Số phòng,Giá niêm yết,Giá cho thuê\nT17,701,4200000,4000000',
    stays: 'Mã phòng,Tên khách,SĐT,Ngày vào ở,Ngày hết hạn,Giá thuê,Cọc đang giữ\n701T17,Khách Import,0912345678,2026-10-01,2027-09-30,4000000,4000000',
  };
  TH.router.handle('/import', (root, p, q) => {
    const type = q.type && I.SCHEMAS[q.type] ? q.type : 'readings';
    const sc = I.SCHEMAS[type];
    const perm = X.importPermFor(type);
    const jobs = S.all('importJobs').slice().reverse();
    let parsed = null, mapping = {}, results = null, fileName = '';
    root.innerHTML = U.pageHead({ title: 'Import dữ liệu', sub: 'Không import ô tổng; ngày thiếu không tự gán theo tên file; ô lỗi công thức bị chặn', acts: [U.btn({label:'Chủ nhà — Excel/CSV',href:'#/owners/new?mode=excel',perm:'owners.manage'}),U.btn({label:'Khách hàng — Excel/CSV',href:'#/tenants/intake?mode=excel',perm:'tenants.manage'})] })
      + `<div class="obj-tiles mb16">${Object.entries(I.SCHEMAS).filter(([k]) => TH.ms.on('1B') || !['vendorBills', 'commissions'].includes(k)).map(([k, v]) => `<a class="obj-tile ${k === type ? 'on' : ''}" href="#/import?type=${k}">${esc(v.label)}</a>`).join('')}</div>`
      + (TH.auth.can(perm) ? '' : U.note('warn', 'Không có quyền nhập loại dữ liệu này', 'Chỉ xem được mẫu và lịch sử.'))
      + (sc.hint ? U.note('info', sc.label, esc(sc.hint)) : '')
      + `<div class="two-col"><div class="side-stack">${U.card({ title: '1. Tải file (CSV, dấu phẩy hoặc chấm phẩy)', icon: 'upload', actions: `<button class="btn btn-ghost btn-sm" data-act="tpl">Tải mẫu</button><button class="btn btn-ghost btn-sm" data-act="sample">Dùng file mẫu có lỗi</button>`, body: U.dropzone({ name: 'file', hint: 'Cột: ' + sc.cols.map(c => c[1] + (c[2] ? '*' : '')).join(' · '), multiple: false, accept: '.csv,.txt' }) })}
        <div id="map"></div><div id="res"></div></div>
        <div class="side-stack">${U.card({ title: 'Lịch sử import', icon: 'history', body: jobs.map(j => `<div class="mini-row"><span>${F.datetime(j.at)}</span><span class="grow">${esc(I.SCHEMAS[j.type].label)} · ${esc(j.fileName)}</span><b>${j.ok}/${j.total}</b></div>`).join('') || '<span class="muted small">Chưa có</span>' })}
        ${U.note('info', 'Quy tắc', 'Mỗi dòng có mã nguồn; nhập lại cùng mã không làm tăng đôi doanh thu/chi phí. Dòng trùng hoặc lỗi được bỏ qua và xuất file lỗi.')}</div></div>`;
    const load = (text, name) => {
      fileName = name; const rows = F.parseCSV(text); if (!rows.length) return U.toast('err', 'File rỗng');
      const header = rows[0].map(h => String(h).trim());
      parsed = rows.slice(1).map(r => { const o = {}; header.forEach((h, i) => { o[h] = r[i]; }); return o; });
      mapping = {}; sc.cols.forEach(([k, label]) => { const hit = header.find(h => F.norm(h) === F.norm(label)) || header.find(h => F.norm(h).includes(F.norm(label).split(' ')[0])); mapping[k] = hit || ''; });
      root.querySelector('#map').innerHTML = U.card({ title: '2. Mapping cột (' + parsed.length + ' dòng)', icon: 'columns', body: `<div class="form-grid">${sc.cols.map(([k, label, req]) => U.field({ label: label, req, input: U.select({ name: 'm_' + k, value: mapping[k], options: header, placeholder: '– không nhập –' }) })).join('')}</div><button class="btn btn-primary mt12" data-act="check">3. Kiểm tra dữ liệu</button>` });
      root.querySelector('#res').innerHTML = '';
    };
    const check = () => {
      sc.cols.forEach(([k]) => { mapping[k] = root.querySelector('[name=m_' + k + ']').value; });
      const rows = parsed.map(r => { const o = {}; sc.cols.forEach(([k]) => { o[k] = mapping[k] ? r[mapping[k]] : ''; }); return o; });
      results = X.validateImport(type, rows);
      const cnt = (s) => results.filter(r => r.status === s).length;
      root.querySelector('#res').innerHTML = U.card({ title: '4. Kết quả kiểm tra', icon: 'clipboard-check', actions: `<button class="btn btn-ghost btn-sm" data-act="errs">Xuất file lỗi</button>${TH.auth.can(perm) ? `<button class="btn btn-primary btn-sm" data-act="commit" ${cnt('ok') ? '' : 'disabled'}>Chỉ nhập ${cnt('ok')} dòng hợp lệ</button>` : ''}`,
        body: `<div class="row gap12 mb12">${U.chip('Hợp lệ ' + cnt('ok'), 'green')}${U.chip('Lỗi ' + cnt('error'), 'red')}${U.chip('Trùng ' + cnt('duplicate'), 'amber')}</div>
        <table class="tbl compact"><thead><tr><th>Dòng</th>${sc.cols.map(c => `<th>${esc(c[1])}</th>`).join('')}<th>Kết luận</th></tr></thead><tbody>${results.map(r => `<tr><td>${r.line}</td>${sc.cols.map(([k]) => `<td>${esc(r.data[k] ?? '')}</td>`).join('')}<td>${r.status === 'ok' ? U.chip('Hợp lệ', 'green') : r.status === 'duplicate' ? U.chip('Trùng mã nguồn – bỏ qua', 'amber') : U.chip(r.errs.join('; '), 'red')}</td></tr>`).join('')}</tbody></table>` });
    };
    U.bindDropzones(root, (files) => { const f = files[files.length - 1]; if (!f) return; const rd = new FileReader(); rd.onload = () => load(String(rd.result), f.name); rd.readAsText(f, 'utf-8'); });
    U.bind(root, {
      tpl: () => { F.download('mau-' + type + '.csv', X.importTemplate(type)); },
      sample: () => load(SAMPLES[type] || X.importTemplate(type), 'mau-' + type + '-co-loi.csv'),
      check, errs: () => K.csv('loi-import-' + type + '.csv', ['Dòng', 'Kết luận', 'Lỗi'], (results || []).filter(r => r.status !== 'ok').map(r => [r.line, r.status, r.errs.join('; ')])),
      commit: async () => { if (!(await U.confirm({ title: 'Nhập dữ liệu', text: 'Nhập các dòng hợp lệ? Dòng lỗi/trùng bị bỏ qua.', ok: 'Nhập' }))) return; const j = K.act(() => X.commitImport(type, fileName, results)); if (j) U.toast('ok', `Đã nhập ${j.ok}/${j.total} dòng`); },
    });
  });
})(window.TH);
