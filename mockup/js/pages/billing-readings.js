/* UI-10 Chỉ số điện nước theo kỳ dịch vụ (chốt ngày 22 tháng trước) · tab phòng trống / không thu được · E10 bất thường. */
(function (TH) {
  const S = TH.store, F = TH.f, U = TH.ui, K = TH.kit, Q = TH.q, X = TH.actions, esc = F.esc;
  TH.pages.billingTabs = (cur) => `<div class="subnav">${[['readings', 'Chỉ số', '#/billing/readings', 'readings.view'], ['invoices', 'Hóa đơn', '#/billing/invoices', 'invoices.view'], ['receipts', 'Phiếu thu', '#/billing/receipts', 'payments.view'], ['debts', 'Công nợ', '#/billing/debts', 'debts.viewStatus'], ['collection', 'Thu tiền theo tòa', '#/billing/collection', 'collection.view']]
    .filter(x => TH.auth.can(x[3])).map(([k, l, h]) => `<a class="${k === cur ? 'on' : ''}" href="${h}">${l}</a>`).join('')}</div>`;
  const editReading = (row, period) => {
    const r = row.reading || {};
    K.formDrawer({ title: 'Chỉ số ' + row.room.code + ' – kỳ ' + F.periodShort(period), sub: row.stay ? 'Khách ' + (Q.customer(row.stay.customerId) || {}).name : 'Phòng không có khách', modal: true, fields: [
      { name: 'elPrev', label: 'Điện – chỉ số cũ', type: 'number', value: r.elPrev ?? row.prev.elCurr ?? row.stay?.openingReadings?.electric ?? '', req: true }, { name: 'elCurr', label: 'Điện – chỉ số mới', type: 'number', value: r.elCurr ?? '', req: true },
      { name: 'waPrev', label: 'Nước – chỉ số cũ (nếu tính theo m³)', type: 'number', value: r.waPrev ?? row.prev.waCurr ?? row.stay?.openingReadings?.water ?? '' }, { name: 'waCurr', label: 'Nước – chỉ số mới', type: 'number', value: r.waCurr ?? '' },
      { name: 'people', label: 'Số người', type: 'number', value: r.people ?? (row.stay || {}).people ?? 1 }, { name: 'vehicles', label: 'Số xe phí cũ (ghi đè kỳ)', type: 'number', value: r.vehicles ?? '', help:'Để trống: lấy danh sách cuối kỳ; nhập 0: không tính xe kỳ này.' },
      { name:'parkingVehicles',label:'Xe gửi (ghi đè kỳ)',type:'number',value:r.parkingVehicles ?? '',help:'Để trống: lấy danh sách xe có hiệu lực.' }, { name:'chargingVehicles',label:'Xe sạc (ghi đè kỳ)',type:'number',value:r.chargingVehicles ?? '' }, { name: 'readAt', label: 'Ngày ghi', type: 'date', value: r.readAt || F.today() },
      { name: 'reason', label: 'Lý do (bắt buộc nếu chỉ số giảm)', type: 'textarea', span: true, value: r.reason || '' }],
      onSubmit: (d) => { X.saveReading(Object.assign(d, { roomId: row.room.id, stayId: row.stay && row.stay.id, buildingId: row.room.buildingId, period })); U.toast('ok', 'Đã lưu chỉ số'); } });
  };
  TH.router.handle('/billing/readings', (root, p, q) => {
    const period = q.period || F.nextPeriod(S.meta.period);
    const tab = q.tab || 'phong';
    const bOpts = K.buildingOpts();
    const bid = q.building || (bOpts[0] || [])[0];
    const prevP = F.prevPeriod(period);
    const periods = [...new Set(S.all('meterReadings').map(r => r.period))].sort();
    root.innerHTML = TH.pages.billingTabs('readings') + U.pageHead({ title: 'Chỉ số điện nước', sub: `Kỳ dịch vụ ${F.periodShort(period)} – chốt số ngày ${Q.param('cutoffDay')}/${Number(prevP.slice(5))}; dùng cho hóa đơn tháng ${Number(period.slice(5))}`,
      acts: [U.btn({ label: 'Import chỉ số', icon: 'upload', href: '#/import?type=readings', perm: 'import.finance' }), U.btn({ label: 'Tạo nháp hóa đơn', icon: 'file-plus', cls: 'btn-primary', href: `#/billing/invoices?period=${period}&open=wizard&building=${bid || ''}`, perm: 'invoices.prepare' })] })
      + U.tabs([{ key: 'phong', label: 'Theo phòng' }, { key: 'dien-chung', label: 'Điện chung', count: S.where('sharedMeterGroups', g => g.active !== false && TH.auth.inScope(g.buildingId)).length }, { key: 'phong-trong', label: 'Phòng trống / không thu được' }], tab)
      + '<div id="tb" class="mt16"></div>';
    const tb = root.querySelector('#tb');
    U.bind(root, { tab: (el) => TH.router.setQuery({ tab: el.dataset.key }) });
    if (tab === 'phong') {
      const rooms = (Q.roomsByBuilding()[bid] || []).filter(r => r.exploitation !== 'meter_common').sort((a, b) => a.number - b.number);
      const rows = rooms.map(room => {
        const reading = S.one('meterReadings', r => r.roomId === room.id && r.period === period && !r.vacant);
        const prev = S.one('meterReadings', r => r.roomId === room.id && r.period === prevP && !r.vacant) || {};
        const stay = Q.currentStay(room.id) || Q.pendingStay(room.id);
        let st = 'ok'; if (!reading) st = stay && stay.status === 'active' ? 'missing' : 'na'; else if (reading.anomaly === 'decrease') st = 'decrease'; else if (reading.anomaly === 'spike') st = 'spike';
        return { room, reading, prev, stay, st };
      });
      const cnt = (k) => rows.filter(r => r.st === k).length;
      let view = rows; if (q.st) view = rows.filter(r => r.st === q.st);
      tb.innerHTML = K.filters([{ name: 'period', label: 'Kỳ', options: periods.map(x => [x, F.periodLabel(x)]), value: period, all: false }, { name: 'building', label: 'Tòa', options: bOpts, value: bid, all: false },
        { name: 'st', label: 'Trạng thái', options: [['missing', 'Thiếu chỉ số'], ['decrease', 'Chỉ số giảm'], ['spike', 'Tăng bất thường'], ['ok', 'Đủ dữ liệu']] }], q)
        + `<div class="grid grid-4 mt16 mb16">${U.kpi({ label: 'Phòng trong kỳ', value: rows.length, icon: 'door' })}${U.kpi({ label: 'Đủ dữ liệu', value: cnt('ok'), icon: 'check-circle', tone: 'green' })}${U.kpi({ label: 'Thiếu chỉ số', value: cnt('missing'), icon: 'alert-circle', tone: 'amber' })}${U.kpi({ label: 'Bất thường', value: cnt('decrease') + cnt('spike'), cap: 'chỉ số giảm / tăng đột biến', icon: 'alert-triangle', tone: 'red' })}</div>`
        + (cnt('decrease') ? U.note('danger', 'Có chỉ số mới nhỏ hơn chỉ số cũ', 'Hóa đơn của phòng này bị chặn tạo nháp cho đến khi nhập lại hoặc ghi lý do (thay đồng hồ, nhập sai kỳ trước).') : '')
        + K.tableCard('t', 'Chỉ số theo phòng – bấm dòng để nhập/sửa');
      K.bindFilters(tb, ['tab']);
      const stChip = { ok: U.chip('Đủ dữ liệu', 'green'), missing: U.chip('Thiếu chỉ số', 'amber'), decrease: U.chip('Chỉ số giảm', 'red'), spike: U.chip('Tăng bất thường', 'orange'), na: U.chip('Không phát sinh', 'gray') };
      U.table(tb.querySelector('#t'), { rows: view, pageSize: 50, onRowOpen: (r) => TH.auth.can('readings.manage') && !(r.reading && r.reading.locked) ? editReading(r, period) : U.toast('info', r.reading && r.reading.locked ? 'Chỉ số đã khóa (đã vào hóa đơn phát hành)' : 'Không có quyền nhập chỉ số'), cols: [
        { key: 'room', label: 'Phòng', render: r => `<b class="code">${esc(r.room.code)}</b>` },
        { key: 'stay', label: 'Lượt thuê', render: r => r.stay ? U.cell2(esc(r.stay.code), esc((Q.customer(r.stay.customerId) || {}).name || '')) : '<span class="muted">Trống</span>' },
        { key: 'ep', label: 'Điện cũ', num: true, render: r => r.reading ? F.num0(r.reading.elPrev) : '–' }, { key: 'ec', label: 'Điện mới', num: true, render: r => r.reading ? F.num0(r.reading.elCurr) : '–' },
        { key: 'eu', label: 'Tiêu thụ (kWh)', num: true, render: r => r.reading ? `<b class="${r.st === 'decrease' ? 'red' : ''}">${F.num0(r.reading.elCurr - r.reading.elPrev)}</b>` : '–' },
        { key: 'w', label: 'Nước cũ → mới', num: true, render: r => r.reading && r.reading.waCurr != null ? F.num0(r.reading.waPrev) + ' → ' + F.num0(r.reading.waCurr) : '<span class="muted small">theo người</span>' },
        { key: 'pp', label: 'Người', num: true, render: r => r.reading ? r.reading.people : (r.stay || {}).people || '–' },
        { key: 'd', label: 'Ngày ghi', render: r => r.reading ? F.date(r.reading.readAt) : '–' },
        { key: 'src', label: 'Nguồn', render: r => r.reading ? `<span class="small muted">${esc(r.reading.source === 'SRC-08' ? 'Excel SRC-08' : r.reading.source === 'demo' ? 'Demo sinh' : 'Nhập web')}</span>${r.reading.locked ? ' ' + U.chip('Đã khóa', 'gray') : ''}` : '' },
        { key: 'st', label: 'Trạng thái', render: r => stChip[r.st] },
      ] });
    } else if (tab === 'dien-chung') {
      // Điện chung (dòng 12): nhóm phòng dùng chung đồng hồ; chỉ số kỳ → chia theo phòng/người khi tạo nháp hóa đơn
      const groups = S.where('sharedMeterGroups', g => g.active !== false && g.buildingId === bid);
      const rdOf = (g) => S.one('meterReadings', r => r.groupId === g.id && r.period === period);
      const prevOf = (g) => S.one('meterReadings', r => r.groupId === g.id && r.period === prevP) || {};
      tb.innerHTML = K.filters([{ name: 'period', label: 'Kỳ', options: periods.map(x => [x, F.periodLabel(x)]), value: period, all: false }, { name: 'building', label: 'Tòa', options: bOpts, value: bid, all: false }], q, U.btn({ label: 'Thêm nhóm điện chung', icon: 'plus', size: 'btn-sm', act: 'addg', perm: 'rates.manage' }))
        + U.note('info', 'Dòng 12 "Điện chung"', 'Tiền điện chung = (chỉ số mới − cũ) × đơn giá, chia cho các lượt thuê trong kỳ của các phòng trong nhóm (theo phòng hoặc theo số người). Thiếu chỉ số điện chung → hóa đơn các phòng trong nhóm bị giữ ở bước tạo nháp.')
        + '<div class="mt12">' + K.tableCard('t', groups.length + ' nhóm – bấm dòng để nhập chỉ số kỳ ' + F.periodShort(period)) + '</div>';
      K.bindFilters(tb, ['tab']);
      const share = (g) => { const st = X.billableStays(period, [g.buildingId]).filter(x => g.roomIds.includes(x.roomId)); const rd = rdOf(g); return rd && st.length ? (rd.elCurr - rd.elPrev) * g.unit / st.length : null; };
      U.table(tb.querySelector('#t'), { rows: groups, noPager: true, empty: U.empty({ title: 'Tòa chưa có nhóm điện chung' }), onRowOpen: (g) => { const rd = rdOf(g) || {}; if (rd.locked) return U.toast('info', 'Chỉ số đã khóa (đã vào hóa đơn phát hành)');
          K.formDrawer({ title: 'Chỉ số điện chung – ' + g.name, sub: 'Kỳ ' + F.periodShort(period), modal: true, fields: [{ name: 'prev', label: 'Chỉ số cũ', type: 'number', req: true, value: rd.elPrev ?? prevOf(g).elCurr ?? '' }, { name: 'curr', label: 'Chỉ số mới', type: 'number', req: true, value: rd.elCurr ?? '' }, { name: 'readAt', label: 'Ngày ghi', type: 'date', value: rd.readAt || F.today() }, { name: 'reason', label: 'Lý do (nếu chỉ số giảm)', type: 'textarea', span: true }],
            onSubmit: (d) => { X.saveSharedReading(Object.assign(d, { groupId: g.id, period })); U.toast('ok', 'Đã lưu chỉ số điện chung'); } }); }, cols: [
        { key: 'n', label: 'Nhóm / đồng hồ', render: g => U.cell2(`<b>${esc(g.name)}</b>`, esc(g.meterCode || '')) }, { key: 'r', label: 'Phòng', render: g => `<span class="small">${g.roomIds.map(Q.roomCode).map(esc).join(', ')}</span>` },
        { key: 'm', label: 'Cách chia', render: g => g.method === 'people' ? 'Theo người' : 'Theo phòng' }, { key: 'u', label: 'Đơn giá', num: true, render: g => F.vnd(g.unit) },
        { key: 'c', label: 'Chỉ số cũ → mới', num: true, render: g => { const rd = rdOf(g); return rd ? F.num0(rd.elPrev) + ' → ' + F.num0(rd.elCurr) : U.chip('Thiếu chỉ số', 'amber'); } },
        { key: 'a', label: 'Tiền điện chung', num: true, render: g => { const rd = rdOf(g); return rd ? F.vnd((rd.elCurr - rd.elPrev) * g.unit) : '–'; } },
        { key: 's', label: 'Bình quân / phòng', num: true, render: g => { const v = share(g); return v == null ? '–' : F.vnd(v); } },
        { key: 'l', label: '', render: g => (rdOf(g) || {}).locked ? U.chip('Đã khóa', 'gray') : '' }] });
      U.bind(tb, { addg: () => { const rs = (Q.roomsByBuilding()[bid] || []).filter(r => r.exploitation !== 'meter_common').sort((a, b) => a.number - b.number);
        const d = K.formDrawer({ title: 'Thêm nhóm điện chung – ' + ((Q.building(bid) || {}).code || ''), wide: true, fields: [{ name: 'name', label: 'Tên nhóm', req: true, placeholder: 'VD: Hành lang tầng 2–3' }, { name: 'meterCode', label: 'Mã đồng hồ' },
          { name: 'method', label: 'Cách chia', type: 'select', req: true, value: 'rooms', options: [['rooms', 'Chia đều theo phòng'], ['people', 'Theo số người']] }, { name: 'unit', label: 'Đơn giá (đ/kWh)', type: 'money', req: true, value: 3500 },
          { type: 'html', span: true, html: `<label class="small muted">Phòng trong nhóm (≥ 2)</label><div class="row wrap gap8 mt4">${rs.map(r => `<label class="chk"><input type="checkbox" name="gr_${r.id}"> <span>${esc(r.code)}</span></label>`).join('')}</div>` }],
          submit: 'Lưu nhóm', onSubmit: (x) => { X.addSharedGroup({ buildingId: bid, name: x.name, meterCode: x.meterCode, method: x.method, unit: x.unit, roomIds: rs.filter(r => d.el.querySelector(`[name="gr_${r.id}"]`).checked).map(r => r.id) }); U.toast('ok', 'Đã thêm nhóm điện chung'); } }); } });
    } else {
      const rows = S.where('meterReadings', r => r.vacant && (!q.building || r.buildingId === q.building) && TH.auth.inScope(r.buildingId));
      const el = rows.reduce((s, r) => s + (r.elAmount || 0), 0), wa = rows.reduce((s, r) => s + (r.waAmount || 0), 0);
      tb.innerHTML = U.note('info', 'Không tạo hóa đơn khách', 'Điện nước của phòng trống và phòng phá HĐ không thu được vẫn đo để đối chiếu thu–chi điện nước theo tòa (báo cáo âm dương – Phase 2).')
        + `<div class="grid grid-3 mt16 mb16">${U.kpi({ label: 'Điện không thu được', value: F.vnd(el), cap: F.num0(rows.reduce((s, r) => s + (r.elCurr - r.elPrev), 0)) + ' kWh', icon: 'zap', tone: 'amber' })}${U.kpi({ label: 'Nước không thu được', value: F.vnd(wa), icon: 'droplet', tone: 'blue' })}${U.kpi({ label: 'Số phòng', value: rows.length, icon: 'door' })}</div>`
        + K.tableCard('t', 'Kỳ ' + F.periodShort('2026-09') + ' – từ sheet ĐIỆN NƯỚC PHÒNG TRỐNG');
      U.table(tb.querySelector('#t'), { rows, pageSize: 30, cols: [
        { key: 'r', label: 'Phòng', render: r => `<b class="code">${esc(r.roomCode || Q.roomCode(r.roomId))}</b>` }, { key: 'e', label: 'Điện cũ → mới', num: true, render: r => F.num0(r.elPrev) + ' → ' + F.num0(r.elCurr) },
        { key: 'ea', label: 'Tiền điện', num: true, render: r => F.vnd(r.elAmount) }, { key: 'w', label: 'Nước', num: true, render: r => r.waCurr ? F.num0(r.waPrev) + ' → ' + F.num0(r.waCurr) : '–' }, { key: 'wa', label: 'Tiền nước', num: true, render: r => F.vnd(r.waAmount) },
        { key: 'n', label: 'Lý do', render: r => esc({ PT: 'Phòng trống', 'kh phá hd': 'Khách phá HĐ không thu được' }[r.reason] || r.reason || '') }] });
    }
  });
})(window.TH);
