import { buildInitialState } from '../../app/core/seed.mjs';

export const env = (role = 'admin', today = '2026-09-24') => ({
  today, now: `${today}T10:00`, actor: { id: `u-${role}`, name: `${role} test`, role },
});

/** Giống store.transaction: clone, chạy, throw thì trả nguyên state cũ. */
export function tx(state, fn) {
  const draft = structuredClone(state);
  const result = fn(draft);
  return { state: draft, result };
}

export const fresh = () => buildInitialState();
