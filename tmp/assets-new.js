  /* Bảng tài sản Điều 2.2 – nhận diện theo tên chuẩn của template ở bất kỳ layout nào (mỗi ô một dòng hoặc cả hàng một dòng); text giữa hai tên là số lượng/tình trạng của tên đứng trước */
  P.parseAssets = (raw) => {
    const region = block(raw, /Tên nội thất/i, /ĐIỀU 3/i); if (!region) return [];
    const nr = F.norm(region); const names = [].concat(P.ASSETS.furniture.map(n => [n, 'furniture']), P.ASSETS.device.map(n => [n, 'device'])).sort((a, b) => b[0].length - a[0].length);
    const taken = []; const hits = [];
    names.forEach(([name, kind]) => { const key = F.norm(name); let i = 0; while ((i = nr.indexOf(key, i)) >= 0) { const end = i + key.length; const before = i === 0 ? ' ' : nr[i - 1], after = nr[end] || ' '; const ok = /[\s:|]/.test(before) && /[\s:,.|]/.test(after) && !taken.some(([a, b]) => i < b && end > a); if (ok) { taken.push([i, end]); hits.push({ name, kind, pos: i, end }); } i = end; } });
    hits.sort((a, b) => a.pos - b.pos);
    const COND = /(bình thường|sạch|tốt|mới|cũ|hỏng|hư|bẩn|trầy|xước|thiếu|không có)/gi;
    return hits.map((h, i) => { const rest = region.slice(h.end, i + 1 < hits.length ? hits[i + 1].pos : undefined).replace(/(Số|lượng|Tình trạng|Tên thiết bị|Tên nội thất)/gi, ' '); const q = rest.match(/(?:^|[\s:])(\d+)\s*(bộ|cái|chiếc|đôi)?(?=\s|$)/i); const conds = (rest.match(COND) || []).map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()); const desc = clean(rest.replace(COND, ' ').replace(q ? q[0] : '', ' ').replace(/[\d\f]/g, ' ')); return { name: h.name, kind: h.kind, qty: q ? q[1] + (q[2] ? ' ' + q[2] : '') : '', condition: conds.join(' '), desc: desc.length <= 60 ? desc : '' }; });
  };

