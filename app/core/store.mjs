// Store localStorage có schema version. Mọi thay đổi đi qua transaction():
// structuredClone → fn(draft) → nếu throw thì bỏ draft (rollback toàn bộ), không thì swap + save + báo subscriber.
import { buildInitialState, SCHEMA } from './seed.mjs';

const KEY = 'th.nguonnha.v1';
const storage = typeof localStorage !== 'undefined' ? localStorage : null;
let state = null;
const subs = new Set();

export function load() {
  try {
    const raw = storage?.getItem(KEY);
    const s = raw ? JSON.parse(raw) : null;
    if (s?.meta?.schema === SCHEMA) {
      state = s;
      if (s.meta.session && !s.meta.session.remember && !sessionStorage.getItem('th.demo.session')) {
        state.meta.session = null;
        save();
      }
      return { reseeded: false };
    }
  } catch { /* dữ liệu hỏng → seed lại */ }
  state = buildInitialState();
  save();
  return { reseeded: true };
}

export const get = () => state;

export function save() {
  try { storage?.setItem(KEY, JSON.stringify(state)); } catch (e) { console.warn('Không lưu được localStorage', e); }
}

export function transaction(fn) {
  const draft = structuredClone(state);
  const result = fn(draft);
  state = draft;
  save();
  subs.forEach((s) => s(state));
  return result;
}

/** Thay đổi tùy chọn giao diện (vai trò demo, công tắc chip…) — không ghi audit. */
export const setMeta = (patch) => transaction((d) => {
  Object.assign(d.meta, patch);
  if (patch.role && d.meta.session && !Object.hasOwn(patch, 'session')) {
    d.meta.session.role = patch.role;
    d.meta.session.userId = `u-${patch.role}`;
  }
});

export function reset() {
  const role = state?.meta?.role;
  state = buildInitialState();
  if (role) {
    state.meta.role = role;
    state.meta.session.role = role;
    state.meta.session.userId = `u-${role}`;
  }
  save();
  subs.forEach((s) => s(state));
}

export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
