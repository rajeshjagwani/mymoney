/* MyMoney — router and event wiring. Routes look like #/save/goal?id=g1 */
(function () {
  const CQ = window.CQ;
  let lastPath = null;

  CQ.parse = function () {
    const h = location.hash.replace(/^#\/?/, '') || 'home';
    const i = h.indexOf('?');
    const path = i === -1 ? h : h.slice(0, i);
    const params = {};
    if (i !== -1) new URLSearchParams(h.slice(i + 1)).forEach((v, k) => { params[k] = v; });
    return { path, params };
  };

  CQ.go = function (path) {
    if (location.hash === '#/' + path) CQ.refresh();
    else location.hash = '#/' + path;
  };
  CQ.refresh = () => render(true);

  function render(keepScroll) {
    const s = CQ.state();
    const r = CQ.parse();
    let fn = CQ.routes[r.path];
    let path = r.path;
    if (!s.children.length && path !== 'welcome') { fn = CQ.routes.welcome; path = 'welcome'; }
    if (!fn) fn = CQ.routes.home;
    if (CQ.tourActive && CQ.tourActive() && path !== 'home') CQ.endTour();
    const c = CQ.child();
    document.body.className = 'mode-' + (c ? c.mode : 'kid') + (path === 'welcome' ? ' zone-ob' : '') +
      (CQ.modalOpen || (CQ.tourActive && CQ.tourActive()) ? ' no-scroll' : '');
    const y = window.scrollY;
    let html;
    try { html = fn(r.params); }
    catch (e) {
      console.error(e);
      html = CQ.shell('<div class="card center"><div class="big-emoji">🙈</div><h2>Oops!</h2><p>Something went wrong on this page.</p><a class="btn btn-primary" href="#/home">Go home</a></div>', { title: 'Oops' });
    }
    if (html == null) return; // route redirected
    const appEl = document.getElementById('app');
    appEl.innerHTML = html;
    if (keepScroll && r.path === lastPath) window.scrollTo(0, y);
    else {
      window.scrollTo(0, 0);
      // Slide the cards in only when a new page opens (not on every little update).
      appEl.classList.remove('enter'); void appEl.offsetWidth; appEl.classList.add('enter');
      clearTimeout(render.enterTimer);
      render.enterTimer = setTimeout(() => appEl.classList.remove('enter'), 900);
    }
    // innerHTML doesn't honour autofocus, so do it by hand (also after in-page step changes).
    const af = document.querySelector('#app [autofocus]');
    if (af) af.focus({ preventScroll: true });
    lastPath = r.path;
    if (CQ.enhance) CQ.enhance();
    if (CQ.afterRender) { const f = CQ.afterRender; CQ.afterRender = null; f(); }
  }

  /* Event delegation: data-act (click), data-form (submit), data-input, data-change. */
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-act]');
    if (!el) return;
    if (el.dataset.act === 'overlay-bg' && e.target !== el) return;
    const fn = CQ.actions[el.dataset.act];
    if (!fn) return;
    e.preventDefault();
    if (!el.dataset.quiet && CQ.sfx) CQ.sfx('tap');
    fn(el, e);
  });
  document.addEventListener('submit', (e) => {
    const f = e.target;
    const fn = CQ.forms[f.dataset.form];
    if (!fn) return;
    e.preventDefault();
    fn(f, new FormData(f), e.submitter || null);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el && CQ.inputs[el.dataset.input]) CQ.inputs[el.dataset.input](el, e);
  });
  document.addEventListener('change', (e) => {
    if (e.target.matches('.chip input') && CQ.sfx) { CQ.sfx('tap'); CQ.buzz(8); }
    const el = e.target.closest('[data-change]');
    if (el && CQ.changes[el.dataset.change]) CQ.changes[el.dataset.change](el, e);
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && CQ.modalOpen) CQ.closeModal(); });
  CQ.actions['close-modal'] = () => CQ.closeModal();
  CQ.actions['overlay-bg'] = () => CQ.closeModal();

  window.addEventListener('hashchange', () => render(false));
  window.addEventListener('storage', (e) => { if (e.key === 'pennypath.v1') { CQ.load(); CQ.refresh(); } });

  CQ.load();
  const c = CQ.child();
  if (c) { CQ.state().children.forEach((k) => CQ.checkBadges(k, { silent: true })); CQ.save(); }
  render(false);
})();
