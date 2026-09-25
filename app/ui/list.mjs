import { card, table, filters, esc } from './shell.mjs';
import { fsel, fsearch, paginate, pager, emptyState } from './controls.mjs';

// Khung list Common Rule 6: tất cả điều kiện đọc từ URL; màn truyền dòng đã lọc theo quyền.
export function listView(ctx, { title, rows, columns, rowCells, filterFields = [], searchFields = [],
  searchPlaceholder = 'Tìm kiếm…', pageSize = 50, rowHref, emptyTitle = 'Chưa có dữ liệu' }) {
  const q = ctx.query.q?.trim().toLocaleLowerCase('vi') || '';
  const selected = rows.filter((row) => filterFields.every(({ name, value }) => !ctx.query[name] || String(value(row)) === ctx.query[name])
    && (!q || searchFields.some((field) => String(field(row) ?? '').toLocaleLowerCase('vi').includes(q))));
  const page = paginate(selected, ctx.query.page, pageSize);
  const bar = filters(filterFields.map(({ name, label, options }) => fsel(label, name, ctx.query[name] || '', options)),
    fsearch('q', ctx.query.q || '', searchPlaceholder));
  const body = !rows.length ? emptyState(emptyTitle) : !selected.length
    ? emptyState('Không có kết quả phù hợp', 'Thử thay đổi bộ lọc hoặc từ khóa')
    : table(columns, page.rows.map((row) => {
      const cells = rowCells(row);
      if (rowHref) cells._attrs = `data-href="${esc(rowHref(row))}"`;
      return cells;
    }), { foot: pager(page) });
  return card(title, `${bar}${body}`);
}
