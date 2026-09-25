import { parseCSV, mapColumns } from '../core/domain/rooms.mjs';
import { DomainError } from '../core/audit.mjs';

// Parser và ánh xạ cột của FR05 được tái dùng; mỗi FR cung cấp validate/commit riêng.
export function createImportWizard({ validate, commit, source = 'CSV' }) {
  const state = { step: 0, fileName: '', headers: [], cells: [], mapping: {}, results: [] };
  return {
    state,
    load(fileName, text) {
      const rows = parseCSV(text);
      if (rows.length < 2) throw new DomainError('File import không có dữ liệu');
      Object.assign(state, { step: 1, fileName, headers: rows[0], cells: rows.slice(1),
        mapping: mapColumns(rows[0]), results: [] });
      return state;
    },
    map(field, column) { state.mapping[field] = Number(column); state.step = 2; },
    preview(ctx) { state.results = validate(state.cells, state.mapping, ctx); state.step = 3; return state.results; },
    save(ctx) {
      if (state.step !== 3) throw new DomainError('Cần kiểm tra dữ liệu trước khi import');
      return ctx.tx((draft, env) => commit(draft, env, state.results, { fileName: state.fileName, source }));
    },
  };
}
