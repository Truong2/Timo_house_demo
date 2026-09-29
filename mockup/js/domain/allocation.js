/* Domain – phân bổ quỹ chung theo số phòng (đặc tả UI-16, SRC-07 G1 C36–C46, GĐ OQ-04). Thuần.
   Kết quả tòa = cố định/tòa + phụ phí/phòng × số phòng + quỹ / mẫu số × số phòng. */
(function (TH) {
  const C = TH.calc = TH.calc || {};
  const A = {};
  A.allocate = ({ funds, roomsByBuilding, denominator }) => {
    const bids = Object.keys(roomsByBuilding);
    const sumRooms = bids.reduce((s, b) => s + (roomsByBuilding[b] || 0), 0);
    const D = denominator || sumRooms;
    const lines = funds.map(f => {
      const results = {}; let total = 0;
      bids.forEach(b => {
        const r = roomsByBuilding[b] || 0;
        const d = f.denominator || D;
        const v = (f.fixedPerBuilding || 0) * (r ? 1 : 0) + (f.surchargePerRoom || 0) * r + (d ? (f.amount || 0) * r / d : 0);
        results[b] = v; total += v;
      });
      const expected = (f.amount || 0) * (sumRooms / (f.denominator || D)) + (f.surchargePerRoom || 0) * sumRooms + (f.fixedPerBuilding || 0) * bids.filter(b => roomsByBuilding[b]).length;
      return { lineCode: f.lineCode, fund: f.amount, surchargePerRoom: f.surchargePerRoom || 0, fixedPerBuilding: f.fixedPerBuilding || 0, denominator: f.denominator || D, results, total, unallocated: (f.amount || 0) - (total - (f.surchargePerRoom || 0) * sumRooms - (f.fixedPerBuilding || 0) * bids.filter(b => roomsByBuilding[b]).length), expected };
    });
    return { denominator: D, sumRooms, lines, gap: D - sumRooms };
  };
  C.allocation = A;
})(window.TH);
