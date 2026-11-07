/* MyMoney — UI helpers: formatting, charts, toasts, modals, celebrations, shared layout. */
(function () {
  const CQ = window.CQ;
  CQ.routes = {}; CQ.actions = {}; CQ.forms = {}; CQ.inputs = {}; CQ.changes = {};

  CQ.esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- Money ---------- */
  const fmtCache = {};
  CQ.currency = () => CQ.CURRENCIES.find((c) => c.code === (CQ.obCurrency || CQ.state().settings.currency)) || CQ.CURRENCIES[0];
  CQ.money = function (n) {
    const c = CQ.currency();
    const whole = c.code === 'JPY' || Math.abs(n % 1) < 0.005;
    const key = c.code + (whole ? '0' : '2');
    if (!fmtCache[key]) {
      fmtCache[key] = new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.code, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
    }
    return fmtCache[key].format(whole ? Math.round(n) : n);
  };
  CQ.sym = function () {
    const c = CQ.currency();
    const p = new Intl.NumberFormat(c.locale, { style: 'currency', currency: c.code }).formatToParts(0).find((x) => x.type === 'currency');
    return p ? p.value : c.code;
  };
  // Replace {123} (an amount in rupees) with the same idea in the chosen currency.
  CQ.fill = (str) => String(str).replace(/\{(\d+(?:\.\d+)?)\}/g, (_, n) => {
    const v = Number(n) * CQ.currency().scale;
    return CQ.money(v >= 10 ? Math.round(v) : Math.round(v * 100) / 100);
  });

  /* ---------- Words by mode ---------- */
  CQ.isTeen = () => { const c = CQ.child(); return !!(c && c.mode === 'teen'); };
  CQ.t = (kid, teen) => (CQ.isTeen() ? teen : kid);
  CQ.srcName = (s) => (CQ.isTeen() ? s.teen : s.kid);
  CQ.plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');

  /* ---------- Dates ---------- */
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  CQ.fmtDate = (iso) => new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  CQ.dayLabel = function (iso) {
    const d = new Date(iso), now = new Date();
    if (sameDay(d, now)) return 'Today';
    if (sameDay(d, new Date(now.getTime() - CQ.DAY))) return 'Yesterday';
    return d.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' });
  };
  CQ.timeLeft = function (iso) {
    const ms = new Date(iso).getTime() - Date.now();
    if (ms <= 0) return '0h';
    const h = Math.ceil(ms / 3600000);
    return h >= 24 ? Math.floor(h / 24) + 'd ' + (h % 24) + 'h' : h + 'h';
  };

  /* ---------- Charts ---------- */
  CQ.donut = function (items, top, sub) {
    const sum = items.reduce((s, i) => s + i.total, 0) || 1;
    const gap = items.length > 1 ? 0.8 : 0;
    let acc = 0;
    const segs = items.map((i) => {
      const pct = (i.total / sum) * 100;
      const len = Math.max(pct - gap, 0.1);
      const seg = '<circle r="15.9155" cx="21" cy="21" fill="none" stroke="' + i.color + '" stroke-width="6" stroke-dasharray="' +
        len.toFixed(3) + ' ' + (100 - len).toFixed(3) + '" stroke-dashoffset="' + (25 - acc).toFixed(3) + '"><title>' +
        CQ.esc(i.name) + ': ' + Math.round(pct) + '%</title></circle>';
      acc += pct;
      return seg;
    }).join('');
    const label = items.map((i) => i.name + ' ' + Math.round((i.total / sum) * 100) + '%').join(', ');
    return '<svg viewBox="0 0 42 42" class="donut" role="img" aria-label="Spending by category: ' + CQ.esc(label) + '">' +
      '<circle r="15.9155" cx="21" cy="21" fill="none" stroke="var(--track)" stroke-width="6"/>' + segs +
      '<text x="21" y="21.5" class="donut-top">' + CQ.esc(top) + '</text><text x="21" y="26.5" class="donut-sub">' + CQ.esc(sub) + '</text></svg>';
  };
  CQ.legend = function (items) {
    const sum = items.reduce((s, i) => s + i.total, 0) || 1;
    return '<ul class="legend">' + items.map((i) =>
      '<li><span class="sw" style="background:' + i.color + '"></span><span>' + i.emoji + ' ' + CQ.esc(i.name) +
      '</span><span class="val">' + Math.round((i.total / sum) * 100) + '%</span></li>').join('') + '</ul>';
  };
  CQ.bars = function (items) {
    const max = Math.max.apply(null, items.map((i) => i.total).concat([1]));
    return '<div class="bars">' + items.map((i) =>
      '<div class="bar-row"><span class="bar-label">' + i.emoji + ' ' + CQ.esc(i.name) + '</span>' +
      '<div class="bar-track"><div class="bar-fill" style="width:' + Math.max(3, (i.total / max) * 100) + '%;background:' + i.color + '"></div></div>' +
      '<span class="bar-val">' + CQ.money(i.total) + '</span></div>').join('') + '</div>';
  };

  /* ---------- Pieces ---------- */
  CQ.progress = (pct, cls) => '<div class="progress ' + (cls || '') + '" role="progressbar" aria-valuenow="' + pct +
    '" aria-valuemin="0" aria-valuemax="100"><div style="width:' + pct + '%"></div></div>';
  CQ.goalPic = (g, cls) => '<span class="' + (cls || 'goal-emoji') + '" aria-hidden="true">' + (g.emoji || '🎯') + '</span>';
  CQ.jar = (pct, g, size) => '<div class="jar ' + (size || '') + '"><div class="jar-lid"></div><div class="jar-body">' +
    '<div class="jar-pending" style="height:' + pct + '%"></div><div class="jar-fill" style="height:' + pct + '%"></div><div class="jar-emoji">' + CQ.goalPic(g, 'jar-pic') + '</div>' +
    '<div class="jar-pct">' + pct + '%</div></div></div>';
  /* King Midas — MyMoney's own mascot: a rich old gold coin with a jewelled crown, monocle, mustache and bow tie. */
  CQ.MASCOT_NAME = 'King Midas';
  CQ.goldsworth = (cls) => '<svg class="goldsworth ' + (cls || '') + '" viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    '<ellipse cx="50" cy="108" rx="26" ry="3.5" fill="rgba(0,0,0,.12)"/>' +
    // bow tie
    '<path d="M50 99 L36 91 V107 Z M50 99 L64 91 V107 Z" fill="#B3261E"/><circle cx="50" cy="99" r="3.6" fill="#7E1A14"/>' +
    // coin face
    '<circle cx="50" cy="64" r="32" fill="#F5B800" stroke="#C78F00" stroke-width="4"/>' +
    '<circle cx="50" cy="64" r="26" fill="none" stroke="#FFE07A" stroke-width="2" stroke-dasharray="2.5 3.5"/>' +
    '<path d="M28 52 A24 24 0 0 1 44 40" fill="none" stroke="#FFF3B8" stroke-width="3" stroke-linecap="round" opacity=".8"/>' +
    // eyes, eyebrows, monocle with chain
    '<path d="M33 52 q6 -4 11 0 M56 51 q6 -4 11 0" fill="none" stroke="#5B3A1E" stroke-width="2.2" stroke-linecap="round"/>' +
    '<circle cx="39" cy="59" r="3.4" fill="#23202B"/><circle cx="61" cy="59" r="3.4" fill="#23202B"/>' +
    '<circle cx="40" cy="58" r="1" fill="#fff"/><circle cx="62" cy="58" r="1" fill="#fff"/>' +
    '<circle cx="61" cy="59" r="8.5" fill="rgba(255,255,255,.28)" stroke="#7A5A00" stroke-width="2.2"/>' +
    '<path d="M69 62 Q79 74 72 90" fill="none" stroke="#7A5A00" stroke-width="1.6" stroke-dasharray="2 1.5"/>' +
    // cheeks, curly mustache, smile
    '<circle cx="31" cy="70" r="4.5" fill="#FF8A65" opacity=".45"/><circle cx="69" cy="71" r="4.5" fill="#FF8A65" opacity=".45"/>' +
    '<path d="M50 70 C45 66 36 66 32 71 C30 74 26 73 26 70 C26 76 33 78 38 75 C43 73 47 74 50 72 C53 74 57 73 62 75 C67 78 74 76 74 70 C74 73 70 74 68 71 C64 66 55 66 50 70 Z" fill="#5B3A1E"/>' +
    '<path d="M42 81 Q50 87 58 81" fill="none" stroke="#23202B" stroke-width="2.6" stroke-linecap="round"/>' +
    // royal gold crown with jewels
    '<path d="M26 37 L23 13 L37 25 L50 5 L63 25 L77 13 L74 37 Z" fill="#FFD43B" stroke="#C99700" stroke-width="2.5" stroke-linejoin="round"/>' +
    '<path d="M30 30 L28 18 L37 27" fill="none" stroke="#FFF1A8" stroke-width="2" stroke-linecap="round" opacity=".8"/>' +
    '<circle cx="23" cy="12" r="3.4" fill="#FFE27A" stroke="#C99700" stroke-width="1.6"/><circle cx="50" cy="4.5" r="3.8" fill="#FFE27A" stroke="#C99700" stroke-width="1.6"/>' +
    '<circle cx="77" cy="12" r="3.4" fill="#FFE27A" stroke="#C99700" stroke-width="1.6"/>' +
    '<circle cx="50" cy="22" r="4" fill="#E5484D" stroke="#9E1F23" stroke-width="1.2"/><circle cx="48.6" cy="20.6" r="1.2" fill="#fff" opacity=".8"/>' +
    '<circle cx="36" cy="28.5" r="2.8" fill="#2F6FEB"/><circle cx="64" cy="28.5" r="2.8" fill="#0E9467"/>' +
    '<rect x="24" y="31" width="52" height="8" rx="3" fill="#F2B300" stroke="#C99700" stroke-width="2"/>' +
    '<circle cx="34" cy="35" r="1.9" fill="#E5484D"/><circle cx="42" cy="35" r="1.6" fill="#fff" opacity=".85"/><circle cx="50" cy="35" r="1.9" fill="#2F6FEB"/>' +
    '<circle cx="58" cy="35" r="1.6" fill="#fff" opacity=".85"/><circle cx="66" cy="35" r="1.9" fill="#E5484D"/></svg>';
  /* Player picture: a rich person made of money — banknote head and body, gold chain, coin pendant, and a crown, top hat or cap. */
  CQ.avatar = function (id, cls) {
    let look = CQ.LOOKS[id];
    if (!look) { // older saves stored an emoji here: pick a look from it so it stays the same each time
      const keys = Object.keys(CQ.LOOKS);
      let h = 0; String(id || '').split('').forEach((ch) => { h = (h * 31 + ch.charCodeAt(0)) >>> 0; });
      look = CQ.LOOKS[keys[h % keys.length]];
    }
    const { note, dark, light, hat, shades } = look, ink = '#1D1D26';
    let hatSvg = '';
    if (hat === 'crown') hatSvg = '<path d="M30 24 L33 8 L42 17 L50 4 L58 17 L67 8 L70 24 Z" fill="#FFD43B" stroke="#C99700" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="50" cy="16" r="2.6" fill="#E5484D"/><circle cx="38" cy="19" r="2" fill="#2F6FEB"/><circle cx="62" cy="19" r="2" fill="#0E9467"/>';
    else if (hat === 'tophat') hatSvg = '<rect x="35" y="1" width="30" height="20" rx="2" fill="#23202B"/><rect x="35" y="14" width="30" height="5" fill="' + dark + '"/>' +
      '<ellipse cx="50" cy="22" rx="23" ry="4" fill="#23202B"/>';
    else hatSvg = '<path d="M28 25 Q29 8 50 8 Q71 8 72 25 Z" fill="' + dark + '"/><path d="M60 22 Q78 21 84 26 Q72 27 60 26 Z" fill="' + dark + '"/>' +
      '<circle cx="50" cy="15" r="4" fill="#FFD43B" stroke="#C99700" stroke-width="1.5"/>';
    const eyes = shades
      ? '<path d="M32 37 H47 V40 A6 6 0 0 1 32 40 Z M53 37 H68 V40 A6 6 0 0 1 53 40 Z" fill="' + ink + '"/><path d="M47 38.5 H53" stroke="' + ink + '" stroke-width="2"/>' +
        '<path d="M35 39 l4 -1.5 M56 39 l4 -1.5" stroke="#fff" stroke-width="1.4" stroke-linecap="round" opacity=".8"/>'
      : '<circle cx="41" cy="39" r="3.4" fill="' + ink + '"/><circle cx="59" cy="39" r="3.4" fill="' + ink + '"/><circle cx="42" cy="38" r="1.1" fill="#fff"/><circle cx="60" cy="38" r="1.1" fill="#fff"/>';
    return '<svg class="money-avatar ' + (cls || '') + '" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
      // body: a banknote suit with coin buttons
      '<rect x="20" y="64" width="60" height="44" rx="12" fill="' + note + '" stroke="' + dark + '" stroke-width="2.5"/>' +
      '<rect x="26" y="70" width="48" height="34" rx="7" fill="none" stroke="' + light + '" stroke-width="1.6" stroke-dasharray="3 2"/>' +
      '<circle cx="34" cy="90" r="2.5" fill="#FFD43B"/><circle cx="66" cy="90" r="2.5" fill="#FFD43B"/>' +
      // gold chain + coin pendant
      '<path d="M35 65 Q50 84 65 65" fill="none" stroke="#F5C400" stroke-width="3.2" stroke-dasharray="3.5 1.5"/>' +
      '<circle cx="50" cy="80" r="7" fill="#FFD43B" stroke="#C99700" stroke-width="2"/><circle cx="50" cy="80" r="3.5" fill="none" stroke="#C99700" stroke-width="1.3"/>' +
      // head: a banknote face with a round watermark
      '<rect x="25" y="20" width="50" height="44" rx="13" fill="' + note + '" stroke="' + dark + '" stroke-width="2.5"/>' +
      '<rect x="30" y="25" width="40" height="34" rx="9" fill="none" stroke="' + light + '" stroke-width="1.5" stroke-dasharray="3 2"/>' +
      '<circle cx="50" cy="43" r="14" fill="' + light + '" opacity=".35"/>' +
      '<path d="M27 32 h4 M69 32 h4 M27 52 h4 M69 52 h4" stroke="' + light + '" stroke-width="2" stroke-linecap="round"/>' +
      eyes +
      '<circle cx="35" cy="48" r="3.5" fill="#FF8A65" opacity=".45"/><circle cx="65" cy="48" r="3.5" fill="#FF8A65" opacity=".45"/>' +
      // big grin with a gold tooth
      '<path d="M39 49 Q50 60 61 49 Z" fill="' + ink + '"/><rect x="51" y="50" width="4" height="3.5" rx="1" fill="#FFD43B"/>' +
      hatSvg + '</svg>';
  };

  CQ.mascot = (_unused, html, cls) => '<div class="mascot ' + (cls || '') + '"><button type="button" class="mascot-face" data-act="mascot-poke" data-quiet="1" aria-label="Poke ' + CQ.MASCOT_NAME + '">' + CQ.goldsworth() +
    '</button><div class="bubble" aria-live="polite">' + html + '</div></div>';
  CQ.guide = (emoji, html) => (CQ.isTeen() ? '' : CQ.mascot(emoji, html, 'guide'));
  CQ.chip = (name, value, label, checked, extra) => '<label class="chip"><input type="radio" name="' + name + '" value="' + CQ.esc(value) + '"' +
    (checked ? ' checked' : '') + (extra || '') + '><span>' + label + '</span></label>';
  CQ.amountField = (name, label, value, extra) => '<label class="field"><span>' + label + '</span><span class="amount-field"><span class="cur">' + CQ.esc(CQ.sym()) +
    '</span><input name="' + name + '" type="number" inputmode="decimal" min="0.01" step="0.01" required placeholder="0"' +
    (value != null ? ' value="' + value + '"' : '') + (extra || '') + '></span></label>';
  CQ.tabs = (items, active) => '<nav class="tabs">' + items.map(([href, label, key]) =>
    '<a href="#/' + href + '" class="tab' + (key === active ? ' active" aria-current="page' : '') + '">' + label + '</a>').join('') + '</nav>';
  CQ.empty = (emoji, title, text, cta) => '<div class="card empty"><div class="big-emoji">' + emoji + '</div><h3>' + title + '</h3><p class="muted">' + text + '</p>' + (cta || '') + '</div>';

  /* ---------- Layout ---------- */
  CQ.shell = function (body, o) {
    o = o || {};
    const c = CQ.child();
    const left = o.back
      ? '<a class="icon-btn" href="#/' + o.back + '" aria-label="Back">←</a>'
      : '<a class="avatar-btn" href="#/profiles" aria-label="Switch player">' + (c ? CQ.avatar(c.avatar) : '🙂') + '</a>';
    const right = '<a class="icon-btn" href="#/settings" aria-label="Settings" title="Settings">⚙️</a>';
    return '<header class="topbar ' + (o.world || '') + '">' + left + '<h1 class="topbar-title">' + (o.title || 'MyMoney') + '</h1>' + right + '</header>' +
      '<main class="page ' + (o.cls || '') + '">' + body + '</main>' + (o.nav === false ? '' : CQ.bottomNav(o.tab));
  };
  CQ.bottomNav = function (tab) {
    const items = [['home', '🏠', 'Home'], ['spend', '📊', 'Track'], ['save', '🫙', 'Save'], ['ask', '🛍️', 'Decide'], ['learn', '📚', 'Learn']];
    return '<nav class="bottomnav" aria-label="Main">' + items.map(([k, e, l]) =>
      '<a href="#/' + k + '"' + (tab === k ? ' class="active" aria-current="page"' : '') + '><span class="bn-emoji" aria-hidden="true">' + e + '</span><span>' + l + '</span></a>').join('') + '</nav>';
  };

  /* ---------- Toasts ---------- */
  CQ.toast = function (msg, kind) {
    const root = document.getElementById('toast-root');
    if (!root) return;
    const el = document.createElement('div');
    el.className = 'toast ' + (kind || '');
    el.setAttribute('role', 'status');
    el.textContent = msg;
    root.appendChild(el);
    if (CQ.sfx) {
      if (kind === 'xp') { CQ.sfx('pop'); CQ.buzz(12); }
      else if (kind === 'warn') { CQ.sfx('oops'); CQ.buzz([30, 40, 30]); }
    }
    setTimeout(() => el.classList.add('out'), 2300);
    setTimeout(() => el.remove(), 2800);
  };

  /* ---------- Modals & celebrations ---------- */
  CQ.modalOpen = false;
  CQ.openModal = function (html, cls) {
    const root = document.getElementById('overlay-root');
    root.innerHTML = '<div class="overlay" data-act="overlay-bg"><div class="modal ' + (cls || '') + '" role="dialog" aria-modal="true">' + html + '</div></div>';
    CQ.modalOpen = true;
    document.body.classList.add('no-scroll');
    const f = root.querySelector('[autofocus]') || root.querySelector('button');
    if (f) f.focus();
  };
  CQ.closeModal = function () {
    document.getElementById('overlay-root').innerHTML = '';
    CQ.modalOpen = false;
    document.body.classList.remove('no-scroll');
    setTimeout(CQ.nextCelebration, 200);
  };
  // In-app "Are you sure?" box (browser confirm() pop-ups are blocked on hosted pages).
  CQ.ask = function (text, yesLabel, onYes, opts) {
    opts = opts || {};
    CQ.askYes = onYes;
    CQ.openModal('<div class="center ask-box"><div class="big-emoji" aria-hidden="true">' + (opts.emoji || '🤔') + '</div><p class="ask-text">' + CQ.esc(text) + '</p>' +
      '<div class="stack"><button class="btn ' + (opts.danger ? 'btn-coral' : 'btn-primary') + ' btn-big btn-block" data-act="ask-yes" autofocus>' + CQ.esc(yesLabel) + '</button>' +
      '<button class="btn btn-ghost btn-block" data-act="close-modal">Cancel</button></div></div>');
  };
  CQ.actions['ask-yes'] = function () {
    const f = CQ.askYes;
    CQ.askYes = null;
    CQ.closeModal();
    if (f) f();
  };
  // Shown when a spend is bigger than the wallet. The purchase is stopped, not just warned about.
  CQ.notEnough = function (have, need) {
    CQ.sfx('buzz'); CQ.buzz([80, 60, 80, 60, 80]);
    CQ.openModal('<div class="center ask-box notenough" role="alertdialog" aria-labelledby="ne-title">' +
      '<div class="warn-badge" aria-hidden="true">⚠️</div><h2 id="ne-title">Not enough money!</h2>' +
      '<p class="ask-text">You have <b>' + CQ.esc(CQ.money(have)) + '</b> in your wallet, but this costs <b>' + CQ.esc(CQ.money(need)) + '</b>.</p>' +
      '<p class="muted">You need <b>' + CQ.esc(CQ.money(CQ.round2(need - have))) + '</b> more. Save up first!</p>' +
      '<button class="btn btn-primary btn-big btn-block" data-act="close-modal" autofocus>OK, I\'ll save up</button></div>', 'modal-warn');
  };
  const queue = [];
  CQ.celebrate = function (c) { queue.push(c); if (!CQ.modalOpen) setTimeout(CQ.nextCelebration, 50); };
  CQ.nextCelebration = function () {
    if (CQ.modalOpen || !queue.length) return;
    const c = queue.shift();
    CQ.openModal('<div class="celebrate"><div class="celebrate-emoji" aria-hidden="true">' + c.emoji + '</div><h2>' + CQ.esc(c.title) +
      '</h2><p>' + CQ.esc(c.text) + '</p><button class="btn btn-primary btn-block btn-big" data-act="close-modal" autofocus>Yay! 🎉</button></div>', 'modal-celebrate');
    CQ.confetti();
    if (CQ.sfx) { CQ.sfx(c.sound || 'magic'); CQ.buzz([40, 60, 40]); }
  };
  CQ.confetti = function () {
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // A shower of money instead of paper confetti.
    const money = ['💵', '💰', '🪙', '💸', '💵', '🪙', '💎', '💴'];
    const wrap = document.createElement('div');
    wrap.className = 'confetti money-rain';
    wrap.setAttribute('aria-hidden', 'true');
    let h = '';
    for (let i = 0; i < 46; i++) {
      h += '<i style="left:' + (Math.random() * 96).toFixed(1) + '%;font-size:' + Math.round(20 + Math.random() * 18) + 'px' +
        ';animation-delay:' + (Math.random() * 0.8).toFixed(2) + 's;animation-duration:' + (2.2 + Math.random() * 1.6).toFixed(2) + 's;--r:' + Math.round(Math.random() * 60 - 30) + 'deg;--s:' + Math.round(Math.random() * 80 - 40) + 'px">' +
        money[i % money.length] + '</i>';
    }
    wrap.innerHTML = h;
    document.body.appendChild(wrap);
    if (CQ.sfx) CQ.sfx('rain');
    setTimeout(() => wrap.remove(), 4500);
  };
})();
