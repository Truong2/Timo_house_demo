(function (TH) {
  const S = TH.store, Q = TH.q, X = TH.actions, _ = X._, F = TH.f, FC = TH.calc.forecast;
  X.createForecast = d => {
    _.need('forecast.manage'); _.needMs('3', 'Dự kiến lợi nhuận');
    // Phạm vi tòa (F14): số gợi ý và khấu hao chỉ tính các tòa trong phạm vi; Excel "Tính đến G15" = loại trừ G16–G18
    const auto = Q.forecastAuto(d.period, d.draftDate, { excluded: d.excludedBuildings || [] }), errs = {};
    const inputs = {}, inputMeta = {};
    ['J3', 'J4', 'J5', 'J6', 'J7', 'E4', 'G4'].forEach(k => {
      const value = Number((d.inputs || {})[k] ?? auto.inputs[k]);
      const reason = String(((d.inputMeta || {})[k] || {}).reason || d.reason || '').trim();
      if (!Number.isFinite(value) || value < 0) errs[k] = 'Số tiền không âm, hợp lệ';
      if (Math.abs(value - auto.inputs[k]) > 0.005 && !reason) errs[k] = 'Khác gợi ý web: bắt buộc lý do';
      inputs[k] = value; inputMeta[k] = Object.assign({}, auto.inputMeta[k], { reason });
    });
    inputs.E4parts = (d.inputs || {}).E4parts || [];
    if (!Array.isArray(inputs.E4parts) || inputs.E4parts.some(p => !Number.isFinite(Number(p.amount)) || Number(p.amount) < 0)) errs.E4 = 'Các phần cọc phải là số không âm';
    else if (inputs.E4parts.length && Math.abs(inputs.E4parts.reduce((s, p) => s + Number(p.amount), 0) - inputs.E4) > 0.5) errs.E4 = 'Tổng các phần cọc phải bằng E4';
    const supplied = d.lines || [], keys = new Set(FC.LINES.map(l => l.key));
    if (new Set(supplied.map(l => l.key)).size !== supplied.length || supplied.some(l => !keys.has(l.key))) errs.lines = 'Dòng chi phí trùng hoặc không hợp lệ';
    const lines = auto.lines.map(l => {
      const inLine = supplied.find(x => x.key === l.key), value = Number(inLine ? inLine.value : l.key === 'marketing' ? inputs.E4 / 2 : l.key === 'refund' ? inputs.G4 : l.value), reason = String((inLine || {}).reason || d.reason || '').trim();
      if (!Number.isFinite(value) || value < 0) errs['line_' + l.key] = 'Chi phí không âm';
      if (Math.abs(value - l.suggested) > 0.005 && !reason) errs['line_' + l.key] = 'Khác gợi ý: bắt buộc lý do';
      return Object.assign({}, l, { value, reason });
    });
    const adjustments = (d.adjustments || []).map(a => ({ amount: Number(a.amount), reason: String(a.reason || '').trim() }));
    if (adjustments.some(a => !Number.isFinite(a.amount) || !a.reason)) errs.adjustmentReason = 'Điều chỉnh bắt buộc số tiền hợp lệ và lý do';
    if (Object.keys(errs).length) { const e = new Error('Kiểm tra lý do và đầu vào dự kiến'); e.fields = errs; throw e; }
    const version = Math.max(0, ...S.all('forecasts').filter(f => f.period === d.period).map(f => f.version)) + 1;
    const rec = S.add('forecasts', { id: 'fc_' + d.period + '_v' + version, period: d.period, version, draftDate: d.draftDate, scopeNote: String(d.scopeNote || auto.scopeNote), excludedBuildings: auto.excludedBuildings, source: 'web', form: 'business', status: 'draft', policyStatus: 'proposed', sourceRef: 'OQ-23', inputs, inputMeta, lines, adjustments, depWeb: auto.depWeb, depRate: Q.param('depRate', d.draftDate), excelCheck: null, by: _.who() });
    _.audit('create', 'forecast', rec.id, 'Dự kiến ' + d.period + ' v' + version + ' – phiên bản bất biến'); _.done(); return JSON.parse(JSON.stringify(rec));
  };
  X.confirmForecast = (id, sourceRef) => {
    _.need('forecast.manage'); _.needMs('3', 'Dự kiến lợi nhuận');
    const rec = S.get('forecasts', id); if (!rec) throw new Error('Không tìm thấy phiên bản dự kiến');
    if (rec.status === 'confirmed') throw new Error('Phiên bản đã được xác nhận');
    if (!String(sourceRef || '').trim()) { const e = new Error('Nhập nguồn / quyết định xác nhận'); e.fields = { sourceRef: 'Bắt buộc có nguồn căn cứ' }; throw e; }
    S.update('forecasts', id, { status: 'confirmed', policyStatus: 'confirmed', sourceRef: String(sourceRef).trim(), approvedBy: _.who(), approvedAt: F.nowISO() });
    _.audit('approve', 'forecast', id, `Xác nhận dự kiến ${rec.period} v${rec.version} – ${sourceRef}`); _.done();
    return JSON.parse(JSON.stringify(S.get('forecasts', id)));
  };
})(window.TH);
