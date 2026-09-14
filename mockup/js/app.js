/* Bootstrap */
(function (TH) {
  const boot = () => {
    const had = TH.store.load();
    if (!had || !TH.store.state.buildings.length) { if (!TH.store.state.users.length || !TH.store.state.buildings.length) { const sess = TH.store.state.session; const g = TH.store.state.guide; TH.store.reset(true); TH.store.state.session = sess; TH.store.state.guide = g || TH.store.state.guide; TH.store.saveNow(); } }
    TH.store.on((what, detail) => { if (what === 'change') { TH.layout.refreshTop(); const meta = (TH.router.current && TH.router.current.route && TH.router.current.route.meta) || {}; const skip = meta.noAutoRefresh === true || (meta.noAutoRefresh === 'timer' && detail && detail.source === 'timer'); if (TH.router.current && TH.router.current.path !== '/login' && !skip) TH.router.refresh(); } if (TH.guide) TH.guide.evaluate(what); });
    if (TH.auth.can('zalo.send')) TH.actions.resumeBatches();
    TH.router.start();
    if (TH.guide) TH.guide.init();
    window.__timehouseDemo = {
      state: () => TH.store.state, actions: TH.actions, selectors: TH.q, store: TH.store,
      currentGuide: () => TH.guide.current(), syncGuide: () => TH.guide.evaluate('sync'), openGuide: (flow) => TH.guide.open(flow), openSample: (id) => TH.guide.openSample(id), useSample: (id) => TH.guide.useSample(id), resetGuideProgress: () => TH.guide.resetProgress(),
      resetData: () => { TH.store.reset(true); location.reload(); }, runAll: () => TH.guide.runAll(), goto: (h) => TH.go(h),
    };
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(window.TH);
