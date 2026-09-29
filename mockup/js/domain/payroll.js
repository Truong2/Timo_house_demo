/* Domain – lương vận hành theo HS (đặc tả UI-25, SRC-05, GĐ OQ-01/02/18). Thuần. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const P = {};
  /* Bảng bậc (ảnh SRC-05): [cận dưới, (dưới 1 năm: thấp, cao), (trên 1 năm: thấp, cao)] */
  P.TIERS = [
    [70, [60000, 69000], [65000, 74000]],
    [75, [70000, 79000], [75000, 84000]],
    [80, [80000, 89000], [85000, 94000]],
    [85, [90000, 99000], [100000, 109000]],
    [90, [100000, 109000], [110000, 119000]],
    [95, [110000, 120000], [120000, 130000]],
  ];
  /* Mốc 1 (TH1: tòa có cọc mới / đóng kỳ 3 tháng trừ cọc + 2 tháng tiền nhà; TH2: bình thường), mốc 2 ×90%, mốc 3 ×70% */
  P.milestones = ({ R5, R10, R15, deduct = 0, w = [1, 0.9, 0.7] }) => {
    const M1 = (R5 - deduct) * w[0], M2 = (R10 - R5) * w[1], M3 = (R15 - R10) * w[2];
    return { M1, M2, M3, A: M1 + M2 + M3 };
  };
  /* Bước 2–5: B = Q/L; T = A − A×B + C; HS = T/K×100 */
  P.opsBuilding = ({ K, L, A, Q, C = 0 }) => {
    const B = L ? Q / L : 0;
    const T = A - A * B + C;
    const HS = K ? T / K * 100 : 0;
    return { B, T, HS };
  };
  /* Quy tắc cận gần nhất (khớp 97/98 dòng SRC-03): HS < a+2,5 → mức thấp/a, còn lại mức cao/(a+5); HS>100 không chặn trần; HS<70 → 10% mức thấp nhất bậc 70–75 */
  P.tierRate = (HS, over1y) => {
    const col = over1y ? 2 : 1;
    if (HS < 70) return { rate: P.TIERS[0][col][0] * 0.1, bound: null, perRoom: P.TIERS[0][col][0] * 0.1, flag: 'HS<70', rule: '10% × mức thấp nhất bậc 70–75' };
    if (HS >= 100) { const r = P.TIERS[5][col][1]; return { rate: r, bound: 100, perRoom: HS * r / 100, flag: HS > 100 ? 'HS>100' : null, rule: `HS × ${r}/100 (không chặn trần)` }; }
    const a = Math.floor(HS / 5) * 5; const t = P.TIERS.find(x => x[0] === a);
    const low = HS < a + 2.5;
    const rate = low ? t[col][0] : t[col][1], bound = low ? a : a + 5;
    return { rate, bound, perRoom: HS * rate / bound, flag: null, rule: `HS × ${rate}/${bound} (cận ${low ? 'dưới' : 'trên'})` };
  };
  /* Thâm niên "trên 1 năm" khi đủ 12 tháng tính đến ngày cuối kỳ lương (GĐ OQ-01d) */
  P.over1y = (hireISO, periodEndISO) => {
    if (!hireISO) return false;
    const [hy, hm, hd] = hireISO.split('-').map(Number); const [py, pm, pd] = periodEndISO.split('-').map(Number);
    const months = (py - hy) * 12 + (pm - hm) - (pd < hd ? 1 : 0);
    return months >= 12;
  };
  /* Một dòng tòa: fixedPerRoom (tòa mới 3 tháng đầu) thay HS */
  P.buildingPay = (inp) => {
    const J = inp.J;
    if (inp.fixedPerRoom) return { V: inp.fixedPerRoom, W: inp.fixedPerRoom * J, HS: null, rule: `Tòa mới: ${inp.fixedPerRoom}/phòng cố định`, flag: 'Lương cố định' };
    const A = inp.A != null ? inp.A : P.milestones(inp).A;
    const b = P.opsBuilding({ K: inp.K, L: inp.L, A, Q: inp.Q, C: inp.C || 0 });
    const t = P.tierRate(b.HS, inp.over1y);
    const flag = t.flag || (!J ? 'Không có phòng' : null);
    return Object.assign({ A, V: t.perRoom, W: t.perRoom * J, rule: t.rule, rate: t.rate, bound: t.bound, flag }, b);
  };
  P.leadPay = (rooms, perRoom = 10000) => rooms * perRoom;
  /* Sale: lương cứng × ngày công / 26 + phụ cấp */
  P.salePay = (base, workdays, divisor = 26) => base * workdays / divisor;
  C.payroll = P;
})(window.TH);
