import { test } from 'node:test';
import assert from 'node:assert/strict';
import { boot, attempt } from './_app.mjs';

test('NT-7 / NT-8 source forecast values reproduce Excel and preserve each formula adjustment', () => {
  const t = boot(), q = t.q, all = q.forecasts(); assert.equal(all.length, 9);
  for (const fc of all) assert.equal(q.forecastResult(fc).benchmark, true, fc.period);
  const fc = all.find(f => f.period === '2026-09'), r = q.forecastResult(fc);
  assert.equal(fc.inputs.J5, 126912000); assert.equal(fc.inputs.E4, 722700000); assert.equal(r.marketing, 361350000); assert.equal(r.dep, 0);
  assert.equal(fc.adjustments[0].amount, 30000000); assert.ok(fc.adjustments[0].reason);
  assert.equal(r.business.rev_total, 7106329529); assert.equal(r.business.tcp, 6468533333); assert.equal(r.business.lnr, 637796196);
  const jan = q.forecastResult(all.find(f => f.period === '2026-01'));
  assert.equal(jan.dep, 640000); assert.equal(jan.primary.tcp, 4827748333); assert.equal(jan.primary.lnr, 705406244);
  const aug = q.forecastResult(all.find(f => f.period === '2026-08'));
  assert.equal(aug.business.rev_total, 6757607525); assert.equal(aug.business.tcp, 6034275000); assert.equal(aug.business.lnr, 723332525);
  const cash = all.find(f => f.period === '2025-08'), excel = q.forecastResult(cash), web = q.forecastResult(cash, 'web');
  assert.equal(web.total.cost_equip + web.total.refundOut, cash.inputs.J3 + cash.inputs.G4); assert.notEqual(web.total.tcp, excel.total.tcp);
});

test('P3-5 forecasts are immutable versions; reasons, valid cost keys, adjustments and E4 parts required', () => {
  const t = boot(), q = t.q, x = t.actions, auto = q.forecastAuto('2026-09', '2026-09-22'), old = JSON.stringify(q.forecast('fc_2026-09_v1'));
  assert.ok(!attempt(() => x.createForecast({ period: auto.period, draftDate: auto.draftDate, inputs: { J6: auto.inputs.J6 + 1 } })).ok);
  assert.ok(!attempt(() => x.createForecast({ period: auto.period, draftDate: auto.draftDate, adjustments: [{ amount: 100 }] })).ok);
  assert.ok(!attempt(() => x.createForecast({ period: auto.period, draftDate: auto.draftDate, lines: [{ key: 'unknown', value: 1 }] })).ok);
  const v2 = x.createForecast({ period: auto.period, draftDate: auto.draftDate, inputs: { J6: auto.inputs.J6 + 1 }, reason: 'Dự kiến thu thêm', adjustments: [{ amount: 100, reason: 'Bổ sung doanh thu' }] });
  assert.equal(v2.version, 2); v2.inputs.J4 = 999; assert.notEqual(q.forecast(v2.id).inputs.J4, 999); assert.equal(JSON.stringify(q.forecast('fc_2026-09_v1')), old);
  t.auth.login('codong'); assert.equal(q.forecast(v2.id), null, 'cổ đông không xem bản web nháp');
  t.auth.login('admin'); x.confirmForecast(v2.id, 'Biên bản xác nhận forecast UAT');
  t.auth.login('codong'); assert.ok(q.forecast(v2.id), 'cổ đông xem được sau khi xác nhận');
  t.auth.login('admin');
  assert.ok(q.forecastVsActual('fc_2026-08_v1').available); assert.equal(q.forecastVsActual(v2.id).available, false);
});

test('P3-5 as-of auto values exclude payments after draft date; phase and shareholder blocked', () => {
  const t = boot(), early = t.q.forecastAuto('2026-09', '2026-09-01'), late = t.q.forecastAuto('2026-09', '2026-09-22');
  assert.ok(late.inputs.J4 > early.inputs.J4); assert.ok(late.recoveryRate >= 0 && late.recoveryRate <= 1);
  t.auth.login('codong'); assert.ok(!attempt(() => t.q.forecastAuto('2026-09', '2026-09-22')).ok, 'cổ đông xem, không lấy gợi ý giao dịch');
  t.auth.login('admin'); t.ms.set('2'); assert.ok(!attempt(() => t.actions.createForecast({ period: '2026-09', draftDate: '2026-09-22' })).ok);
});

test('NT-0 after P3-5', () => { const t = boot({ pages: true }); assert.deepEqual(Array.from(t.pages.acceptance().filter(r => !r.ok), r => r.name), []); });

test('P3-5 saved web and source forecast results freeze depreciation; literal J4 components are counted once', () => {
  const t = boot(), q = t.q, x = t.actions;
  const source = q.forecast('fc_2026-03_v1'); assert.ok(source.inputMeta.J4.adjustments.every(a => a.includedInInput));
  assert.equal(q.forecastResult(source).benchmark, true);
  const web = x.createForecast({ period: '2026-09', draftDate: '2026-09-22' });
  const sourceResult = JSON.stringify(q.forecastResult(q.forecast('fc_2026-09_v1'), 'web')), webResult = JSON.stringify(q.forecastResult(web, 'web'));
  t.store.update('assets', 'as_08_S4', { cost: 99999999 });
  assert.equal(JSON.stringify(q.forecastResult(q.forecast('fc_2026-09_v1'), 'web')), sourceResult);
  assert.equal(JSON.stringify(q.forecastResult(q.forecast(web.id), 'web')), webResult);
  assert.ok(!attempt(() => q.forecastAuto('2026-09', '2026-09-31')).ok);
});

test('F14 phạm vi tòa: loại trừ G16–G18 ("Tính đến G15") giảm số gợi ý, lưu excludedBuildings và scopeNote; ⛔ tòa không tồn tại', () => {
  const t = boot(), q = t.q, x = t.actions, all = q.forecastAuto('2026-09', '2026-09-22');
  const fresh = q.forecastNewBuildings('2026-09').map(b => b.id); assert.deepEqual(Array.from(fresh, id => q.building(id).code).sort(), ['G16', 'G17', 'G18']);
  const part = q.forecastAuto('2026-09', '2026-09-22', { excluded: fresh });
  assert.equal(part.scopeNote, 'Trừ G16, G17, G18'); assert.equal(all.scopeNote, 'Toàn bộ tòa trên web');
  assert.ok(part.inputs.J4 + part.inputs.J5 < all.inputs.J4 + all.inputs.J5, 'thu tiền tòa loại trừ không vào J4/J5');
  const rent = k => k.lines.find(l => l.key === 'cost_rent').suggested; assert.ok(rent(part) < rent(all), 'không cộng tiền thuê tòa mới bị loại trừ');
  const sumBy = (p, ids) => Object.entries(t.qr.get(p, 'total').byBuilding).filter(([b]) => !ids.includes(b)).reduce((n, [, v]) => n + v.sal_mgr, 0);
  assert.equal(part.lines.find(l => l.key === 'sal_mgr').suggested, sumBy('2026-08', fresh), 'chi phí kỳ trước theo tòa trong phạm vi');
  const v = x.createForecast({ period: '2026-09', draftDate: '2026-09-22', excludedBuildings: fresh });
  assert.deepEqual(Array.from(q.forecast(v.id).excludedBuildings).sort(), [...fresh].sort()); assert.equal(q.forecast(v.id).scopeNote, 'Trừ G16, G17, G18');
  assert.ok(!attempt(() => q.forecastAuto('2026-09', '2026-09-22', { excluded: ['b_KHONG'] })).ok);
});

test('UI-40 chỉ số phụ theo SRC-14 sheet 8/2025: TCP/DT = tiền nhà + DV + lương + CPPS + HC = tcp/DT; LN/DT = 1 − TCP/DT; HC chỉ ở dòng tiền', () => {
  const t = boot(), q = t.q;
  for (const fc of q.forecasts()) for (const mode of ['excel', 'web']) {
    const r = q.forecastResult(fc, mode);
    for (const k of ['total', 'business']) {
      const v = r[k], by = Object.fromEntries(r.ratios[k].map(x => [x.key, x.value]));
      assert.ok(Math.abs(by.tcp - v.tcp / v.rev_total) < 1e-12, fc.id + ' ' + mode + ' ' + k); assert.ok(Math.abs(by.tcp + by.ln - 1) < 1e-12);
      assert.ok(Math.abs(by.gv - (v.cost_rent + v.cost_el + v.cost_wa + v.cost_net + v.cost_garbage + v.cost_env + v.cost_elev) / v.rev_total) < 1e-12);
    }
    assert.equal(r.ratios.business.find(x => x.key === 'hc').value, 0); assert.ok(Math.abs(r.ratios.total.find(x => x.key === 'hc').value - r.total.refundOut / r.total.rev_total) < 1e-12);
  }
});
