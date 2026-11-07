/* MyMoney — the playful bits: sounds & buzz, count-up numbers, mascot pokes,
   daily treasure chest, tap-to-drop coins into a jar, and the guided tour. */
(function () {
  const CQ = window.CQ;
  const A = CQ.actions;
  const esc = CQ.esc, money = CQ.money;
  const reduced = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const restart = (el, cls) => { el.classList.remove(cls); void el.offsetWidth; el.classList.add(cls); };

  /* ---------- Sound (tiny synthesized blips, no audio files) & vibration ---------- */
  let ctx = null;
  function audio() {
    if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null; ctx = new AC(); }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // One note. freq2 (optional) slides the pitch to freq2 by the end.
  function tone(freq, start, dur, type, vol, freq2) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain(), t = a.currentTime + start;
    o.type = type || 'sine'; o.frequency.setValueAtTime(freq, t);
    if (freq2) o.frequency.exponentialRampToValueAtTime(freq2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol || 0.12, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(a.destination);
    o.start(t); o.stop(t + dur + 0.03);
  }
  // A burst of filtered noise (for clunks, whooshes and shimmer). f2 sweeps the filter.
  let noiseBuf = null;
  function noise(start, dur, vol, f1, f2, kind) {
    const a = audio(); if (!a) return;
    if (!noiseBuf) {
      noiseBuf = a.createBuffer(1, a.sampleRate, a.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const src = a.createBufferSource(), f = a.createBiquadFilter(), g = a.createGain(), t = a.currentTime + start;
    src.buffer = noiseBuf;
    f.type = kind || 'bandpass'; f.Q.value = 1.2;
    f.frequency.setValueAtTime(f1, t);
    if (f2) f.frequency.exponentialRampToValueAtTime(f2, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(a.destination);
    src.start(t); src.stop(t + dur + 0.05);
  }
  // A shiny bell: a few bright partials ringing together.
  function bell(start, base, vol, dur) {
    [1, 1.5, 2, 2.76].forEach((m, i) => tone(base * m, start, dur * (1 - i * 0.15), i ? 'sine' : 'triangle', vol / (1 + i * 0.6)));
  }
  // Little coins jingling.
  function jingle(start, count, vol) {
    for (let i = 0; i < count; i++) {
      const t = start + i * 0.045 + Math.random() * 0.03, f = 2600 + Math.random() * 2200;
      tone(f, t, 0.09, 'triangle', vol);
      tone(f * 1.34, t + 0.012, 0.07, 'sine', vol * 0.6);
    }
  }
  const SFX = {
    tap: () => tone(700, 0, 0.05, 'triangle', 0.05),
    pop: () => { tone(520, 0, 0.07, 'sine', 0.12); tone(780, 0.05, 0.08, 'sine', 0.08); },
    // KA-CHING! drawer clunk + bright register bell + coins
    kaching: () => {
      noise(0, 0.07, 0.35, 1400, 600);
      tone(150, 0, 0.08, 'square', 0.08, 90);
      noise(0.07, 0.05, 0.2, 3000);
      bell(0.1, 2093, 0.14, 0.9);
      bell(0.22, 2637, 0.1, 0.8);
      jingle(0.3, 6, 0.035);
    },
    // A coin dropping into a glass jar
    coin: () => { tone(2349, 0, 0.12, 'triangle', 0.08); tone(3520, 0.015, 0.1, 'sine', 0.05); tone(1760, 0.09, 0.16, 'triangle', 0.06); noise(0, 0.03, 0.08, 5000); },
    // A handful of coins pouring into a jar
    jar: () => { for (let i = 0; i < 5; i++) { const t = i * 0.07; tone(2000 + i * 180, t, 0.12, 'triangle', 0.06); noise(t, 0.03, 0.06, 4500); } bell(0.38, 1568, 0.07, 0.5); },
    // Money leaving your wallet: whoosh down
    spend: () => { noise(0, 0.35, 0.22, 3200, 350); tone(880, 0, 0.3, 'sine', 0.06, 300); },
    // Coins showering down (plays with the money rain)
    rain: () => jingle(0, 14, 0.03),
    correct: () => { tone(988, 0, 0.12, 'sine', 0.12); tone(1319, 0.1, 0.22, 'sine', 0.12); },
    wrong: () => { tone(220, 0, 0.18, 'sawtooth', 0.05, 180); tone(185, 0.16, 0.25, 'sawtooth', 0.05, 140); },
    // Level-up fanfare
    levelup: () => { [523, 659, 784].forEach((f, i) => tone(f, i * 0.1, 0.18, 'square', 0.05)); [1047, 1319, 1568].forEach((f) => tone(f, 0.32, 0.6, 'triangle', 0.07)); jingle(0.35, 5, 0.025); },
    // Sparkly magic (badges, treasure chest)
    magic: () => { [1047, 1319, 1568, 2093, 2637].forEach((f, i) => tone(f, i * 0.06, 0.35, 'sine', 0.07)); noise(0, 0.5, 0.05, 6000, 9000, 'highpass'); },
    // Big win (goal complete, guide done)
    win: () => { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.09, 0.25, 'triangle', 0.1)); bell(0.36, 2093, 0.08, 0.7); },
    // Skipping a buy: "boing — money kept!"
    keep: () => { tone(330, 0, 0.18, 'sine', 0.12, 660); setTimeout(() => SFX.kaching(), 160); },
    oops: () => { tone(260, 0, 0.12, 'sawtooth', 0.04); tone(200, 0.11, 0.18, 'sawtooth', 0.04); },
    // Buzzer: a harsh "bzzt" for not having enough money
    buzz: () => { tone(160, 0, 0.32, 'sawtooth', 0.09, 120); tone(150, 0.02, 0.3, 'square', 0.04, 110); noise(0, 0.3, 0.05, 900, 400, 'bandpass'); },
  };
  CQ.SOUND_BOARD = [['kaching', '💰 Ka-ching'], ['coin', '🪙 Coin in jar'], ['jar', '🫙 Coins pour'], ['spend', '💸 Spend'], ['rain', '🌧️ Money rain'],
    ['correct', '✅ Right answer'], ['wrong', '❌ Wrong answer'], ['levelup', '🆙 Level up'], ['magic', '✨ Badge'], ['keep', '🙅 Money kept']];
  CQ.soundOn = () => { const s = CQ.state(); return !s || s.settings.sound !== false; };
  CQ.sfx = function (name) { if (!CQ.soundOn()) return; try { if (SFX[name]) SFX[name](); } catch (e) { /* audio not available */ } };
  CQ.buzz = function (pattern) { if (!CQ.soundOn() || !navigator.vibrate) return; try { navigator.vibrate(pattern || 12); } catch (e) { /* ignore */ } };
  A['toggle-sound'] = function () {
    const s = CQ.state();
    s.settings.sound = !CQ.soundOn();
    CQ.save();
    if (s.settings.sound) CQ.sfx('kaching');
    CQ.refresh();
  };
  A['play-sfx'] = function (el) { CQ.sfx(el.dataset.s); CQ.buzz(15); };

  /* ---------- Numbers that count up (wallet, jars) ---------- */
  const lastShown = {};
  CQ.enhance = function () {
    document.querySelectorAll('[data-count]').forEach((el) => {
      const to = Number(el.dataset.count), key = el.dataset.key || '';
      const from = key in lastShown ? lastShown[key] : 0;
      lastShown[key] = to;
      if (from === to || reduced()) { el.textContent = money(to); return; }
      if (to > from && key in lastShownSeen) { const card = el.closest('.wallet-card'); if (card) restart(card, 'bump'); }
      lastShownSeen[key] = true;
      const t0 = performance.now(), dur = 800;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        el.textContent = money(Math.round((from + (to - from) * e) * 100) / 100);
        if (p < 1) requestAnimationFrame(step); else el.textContent = money(to);
      };
      requestAnimationFrame(step);
    });
  };
  const lastShownSeen = {};

  /* ---------- Poke the mascot ---------- */
  A['mascot-poke'] = function (el) {
    restart(el, 'wiggle');
    CQ.sfx('pop'); CQ.buzz(15);
    const b = el.parentElement.querySelector('.bubble');
    if (!b) return;
    let line, tries = 0;
    do { line = CQ.fill(CQ.POKES[Math.floor(Math.random() * CQ.POKES.length)]); tries++; } while (line === b.dataset.last && tries < 5);
    b.dataset.last = line;
    b.textContent = line;
    restart(b, 'pop-in');
  };

  /* ---------- Tap effects: every button pops, glows and (for the big ones) bursts coins ---------- */
  const TAP_SEL = 'button, .btn, a.card, .tile, .world-card, .chip, .tab, .seg a, .bottomnav a, .lesson-item, .notice, .req-card, .wallet-card, .cat-chip';
  const BURST_SEL = '.btn-primary, .btn-green, .btn-coral, .btn-blue, .btn-purple, .coin, .group-btn, .age-btn, .chest, .world-card, [data-act="random-tip"]';
  function tapRing(x, y, big) {
    const r = document.createElement('span');
    r.className = 'tap-ring' + (big ? ' big' : '');
    r.style.left = x + 'px'; r.style.top = y + 'px';
    document.body.appendChild(r);
    setTimeout(() => r.remove(), 650);
  }
  CQ.burst = function (x, y, items) {
    if (reduced()) return;
    items = items || ['🪙', '✨', '💰', '⭐', '💎'];
    for (let i = 0; i < 9; i++) {
      const s = document.createElement('span');
      s.className = 'tap-burst';
      s.textContent = items[i % items.length];
      s.style.left = x + 'px'; s.style.top = y + 'px';
      document.body.appendChild(s);
      const ang = (Math.PI * 2 * i) / 9 + Math.random() * 0.5, d = 38 + Math.random() * 42;
      s.animate([
        { transform: 'translate(-50%,-50%) scale(.3)', opacity: 1 },
        { transform: 'translate(calc(-50% + ' + Math.round(Math.cos(ang) * d) + 'px), calc(-50% + ' + Math.round(Math.sin(ang) * d - 12) + 'px)) scale(1.1)', opacity: 0 },
      ], { duration: 650 + Math.random() * 250, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => s.remove();
    }
  };
  CQ.floatText = function (x, y, text) {
    const s = document.createElement('span');
    s.className = 'float-text'; s.textContent = text;
    s.style.left = x + 'px'; s.style.top = y + 'px';
    document.body.appendChild(s);
    setTimeout(() => s.remove(), 950);
  };
  document.addEventListener('pointerdown', (e) => {
    if (e.button) return;
    const el = e.target.closest(TAP_SEL);
    if (!el || el.disabled || reduced()) return;
    const big = el.matches(BURST_SEL);
    tapRing(e.clientX, e.clientY, big);
    restart(el, 'tap-pop');
    if (big) CQ.burst(e.clientX, e.clientY);
  }, { passive: true });

  /* ---------- Money point cards (a different set of tips in each section) ---------- */
  CQ.tipIdx = {};
  const tipKey = (sec, i) => sec + ':' + i;
  // Counts a tip as read; new tips give a little XP. Returns true the first time.
  CQ.markTip = function (sec, i, x, y) {
    const c = CQ.child();
    if (!c) return false;
    c.tipsRead = c.tipsRead || [];
    const k = tipKey(sec, i);
    if (c.tipsRead.indexOf(k) !== -1) return false;
    c.tipsRead.push(k);
    CQ.addXP(c, 2, null, { quiet: true });
    if (x != null) CQ.floatText(x, y, '+2 XP');
    if (c.tipsRead.length >= 30) CQ.giveBadge(c, 'tip_master');
    CQ.save();
    return true;
  };
  CQ.tipCard = function (sec) {
    const list = CQ.POINTS[sec];
    if (!list || !list.length) return '';
    if (CQ.tipIdx[sec] == null) CQ.tipIdx[sec] = new Date().getDate() % list.length;
    const i = CQ.tipIdx[sec];
    return '<section class="card tip-card"><div class="tip-head"><b>💡 Money point</b><span class="tiny muted tip-count">' + (i + 1) + ' / ' + list.length + '</span>' +
      '<button type="button" class="btn btn-primary btn-small" data-act="next-tip" data-sec="' + sec + '" data-quiet="1">Next →</button></div>' +
      '<p class="tip-text">' + esc(CQ.fill(list[i])) + '</p><a class="tip-more" href="#/tips?c=' + sec + '">See all ' + list.length + ' tips in the Tip Vault →</a></section>';
  };
  A['next-tip'] = function (el, e) {
    const sec = el.dataset.sec, list = CQ.POINTS[sec], card = el.closest('.tip-card');
    CQ.tipIdx[sec] = ((CQ.tipIdx[sec] || 0) + 1) % list.length;
    const p = card.querySelector('.tip-text');
    p.textContent = CQ.fill(list[CQ.tipIdx[sec]]);
    card.querySelector('.tip-count').textContent = (CQ.tipIdx[sec] + 1) + ' / ' + list.length;
    restart(p, 'pop-in');
    CQ.sfx('pop');
    CQ.markTip(sec, CQ.tipIdx[sec], e && e.clientX, e && e.clientY);
  };

  /* Quick points: short tips shown as a still (not scrolling) set of chips in the Tip Vault */
  CQ.quickPoints = function () {
    return '<section class="card"><h3>⚡ Quick points</h3><div class="quick-cloud">' + CQ.QUICK.map((q) => '<span>' + esc(q) + '</span>').join('') + '</div></section>';
  };

  /* ---------- Tip Vault: every tip, by topic ---------- */
  const allTips = () => CQ.POINT_SECTIONS.reduce((n, s) => n + (CQ.POINTS[s.key] || []).length, 0);
  CQ.routes.tips = function (p) {
    const c = CQ.child(), read = c.tipsRead || [], cat = CQ.POINT_SECTIONS.some((s) => s.key === p.c) ? p.c : 'all', total = allTips();
    let body = '<section class="card vault-hero"><div class="big-emoji">💡</div><h2>The Tip Vault</h2><p class="muted">' + total + ' money tips. Tap one to mark it read and earn XP!</p>' +
      CQ.progress(Math.round((read.length / total) * 100), 'green') + '<p class="tiny muted" id="vault-count">' + read.length + ' of ' + total + ' read</p>' +
      '<button class="btn btn-purple btn-big btn-block" data-act="random-tip">🎲 Surprise me with a tip!</button></section>' +
      '<nav class="cat-row" aria-label="Tip topics"><a class="cat-chip' + (cat === 'all' ? ' active' : '') + '" href="#/tips">✨ All</a>' +
      CQ.POINT_SECTIONS.map((s) => '<a class="cat-chip' + (cat === s.key ? ' active' : '') + '" href="#/tips?c=' + s.key + '">' + s.emoji + ' ' + s.label + '</a>').join('') + '</nav>';
    CQ.POINT_SECTIONS.filter((s) => cat === 'all' || s.key === cat).forEach((s) => {
      const list = CQ.POINTS[s.key] || [];
      const done = list.filter((_, i) => read.indexOf(tipKey(s.key, i)) !== -1).length;
      body += '<h2 class="section-title">' + s.emoji + ' ' + s.label + ' <span class="pill">' + done + '/' + list.length + '</span></h2><div class="tip-list">' +
        list.map((t, i) => { const on = read.indexOf(tipKey(s.key, i)) !== -1;
          return '<button class="tip-item' + (on ? ' read' : '') + '" data-act="read-tip" data-sec="' + s.key + '" data-i="' + i + '" data-quiet="1"><span class="ti-check" aria-hidden="true">' + (on ? '✓' : '') + '</span><span>' + esc(CQ.fill(t)) + '</span></button>';
        }).join('') + '</div>';
    });
    if (cat === 'all') body += CQ.quickPoints();
    return CQ.shell(body, { back: 'home', tab: 'learn', title: '💡 Tip Vault' });
  };
  function updateVaultCount() {
    const c = CQ.child(), total = allTips(), n = (c.tipsRead || []).length, el = document.getElementById('vault-count');
    if (el) el.textContent = n + ' of ' + total + ' read';
    const bar = document.querySelector('.vault-hero .progress > div');
    if (bar) bar.style.width = Math.round((n / total) * 100) + '%';
  }
  A['read-tip'] = function (el, e) {
    const first = CQ.markTip(el.dataset.sec, Number(el.dataset.i), e.clientX, e.clientY);
    if (!first) { CQ.sfx('tap'); return; }
    el.classList.add('read');
    el.querySelector('.ti-check').textContent = '✓';
    CQ.sfx('coin');
    CQ.burst(e.clientX, e.clientY, ['✨', '💡', '⭐']);
    updateVaultCount();
  };
  A['random-tip'] = function () {
    const c = CQ.child(), read = c.tipsRead || [], pool = [];
    CQ.POINT_SECTIONS.forEach((s) => (CQ.POINTS[s.key] || []).forEach((t, i) => pool.push({ s, i, t, read: read.indexOf(tipKey(s.key, i)) !== -1 })));
    const unread = pool.filter((x) => !x.read), pick = (unread.length ? unread : pool)[Math.floor(Math.random() * (unread.length || pool.length))];
    CQ.markTip(pick.s.key, pick.i);
    const item = document.querySelector('.tip-item[data-sec="' + pick.s.key + '"][data-i="' + pick.i + '"]');
    if (item) { item.classList.add('read'); item.querySelector('.ti-check').textContent = '✓'; }
    CQ.openModal('<div class="center random-tip"><span class="pill sun">' + pick.s.emoji + ' ' + pick.s.label + '</span>' + CQ.goldsworth('big') +
      '<p class="random-tip-text">' + esc(CQ.fill(pick.t)) + '</p><div class="stack"><button class="btn btn-purple btn-big btn-block" data-act="random-tip">🎲 Another one!</button>' +
      '<button class="btn btn-ghost btn-block" data-act="close-modal">Got it</button></div></div>', 'modal-tip');
    CQ.sfx('pop'); CQ.confetti();
    updateVaultCount();
  };

  /* ---------- Daily treasure chest ---------- */
  CQ.chestCard = function (c) {
    if (c.lastChest === CQ.today()) return '';
    return '<section class="card chest-card"><button class="chest" data-act="open-chest" data-quiet="1" aria-label="Open today\'s treasure chest">🎁</button>' +
      '<div><h3>Daily treasure!</h3><p class="muted" style="margin:0">' + CQ.t('Tap the present to open it!', 'Tap to open today\'s bonus.') + '</p></div></section>';
  };
  A['open-chest'] = function (el) {
    const c = CQ.child();
    if (c.lastChest === CQ.today()) return;
    c.lastChest = CQ.today();
    CQ.save();
    const xp = 5 + 5 * Math.floor(Math.random() * 3);
    const fact = CQ.fill(CQ.FACTS[Math.floor(Math.random() * CQ.FACTS.length)]);
    el.classList.add('opening');
    el.disabled = true;
    CQ.sfx('magic'); CQ.buzz([20, 30, 20]);
    setTimeout(() => {
      const card = el.closest('.chest-card');
      if (card) {
        card.classList.add('opened');
        card.innerHTML = '<div class="chest open" aria-hidden="true">✨</div><div><h3>+' + xp + ' XP!</h3><p style="margin:0">' + esc(fact) + '</p></div>';
      }
      CQ.confetti();
      CQ.addXP(c, xp, 'daily treasure');
      CQ.save();
    }, reduced() ? 0 : 750);
  };

  /* ---------- Tap coins to drop them into a goal jar ---------- */
  CQ.pile = { goal: null, amt: 0, stack: [] };
  CQ.coinTray = function (g) {
    CQ.pile = { goal: g.id, amt: 0, stack: [] };
    return '<div class="coin-tray-wrap"><p class="tray-hint">' + CQ.t('Tap coins to drop them in your jar! 👇', 'Tap to drop money into the jar') + '</p>' +
      '<div class="coin-tray">' + CQ.currency().coins.map((v) =>
        '<button type="button" class="coin" data-act="coin-drop" data-quiet="1" data-v="' + v + '" data-goal="' + g.id + '">' + money(v) + '</button>').join('') + '</div>' +
      '<div class="pile-row"><span>Ready to save: <b id="pile-amt">' + money(0) + '</b></span>' +
      '<button type="button" class="link-btn" data-act="coin-undo" data-goal="' + g.id + '">↶ Undo</button></div>' +
      '<button type="button" class="btn btn-green btn-block btn-big" data-act="coin-save" data-goal="' + g.id + '" id="pile-save" disabled>Save it in the jar 🫙</button></div>';
  };
  function updatePile(g) {
    const plan = CQ.goalPlan(g);
    const pct = Math.min(100, Math.floor(((plan.saved + CQ.pile.amt) / g.price) * 100));
    const pend = document.querySelector('.goal-hero .jar-pending');
    if (pend) pend.style.height = pct + '%';
    const pctEl = document.querySelector('.goal-hero .jar-pct');
    if (pctEl) pctEl.textContent = pct + '%';
    const amt = document.getElementById('pile-amt');
    if (amt) amt.textContent = money(CQ.pile.amt);
    const btn = document.getElementById('pile-save');
    if (btn) btn.disabled = CQ.pile.amt <= 0;
  }
  function flyCoin(from, to) {
    if (!to || reduced()) return;
    const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    const coin = document.createElement('div');
    coin.className = 'flying-coin';
    coin.textContent = '🪙';
    coin.style.left = (a.left + a.width / 2 - 18) + 'px';
    coin.style.top = (a.top + a.height / 2 - 18) + 'px';
    document.body.appendChild(coin);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + 24 - (a.top + a.height / 2);
    const anim = coin.animate([
      { transform: 'translate(0,0) scale(1) rotate(0deg)' },
      { transform: 'translate(' + dx * 0.5 + 'px,' + (Math.min(dy, 0) - 70) + 'px) scale(1.25) rotate(200deg)', offset: 0.5 },
      { transform: 'translate(' + dx + 'px,' + dy + 'px) scale(.55) rotate(360deg)', opacity: 0.85 },
    ], { duration: 650, easing: 'ease-in-out' });
    anim.onfinish = () => { coin.remove(); const jar = to.closest('.jar'); if (jar) restart(jar, 'wiggle'); };
  }
  A['coin-drop'] = function (el) {
    const g = CQ.goal(el.dataset.goal), c = CQ.child(), pile = CQ.pile;
    if (!g || pile.goal !== g.id) return;
    const v = Number(el.dataset.v), bal = CQ.balance(c.id), left = CQ.goalPlan(g).left;
    if (pile.amt >= left) { CQ.toast('Your jar is full! 🎉', 'warn'); return; }
    if (pile.amt + v > bal + 1e-9) {
      const rest = CQ.round2(bal - pile.amt);
      CQ.toast(rest > 0 ? 'Only ' + money(rest) + ' left in your wallet' : 'Your wallet is empty!', 'warn');
      restart(el, 'shake');
      return;
    }
    pile.amt = CQ.round2(pile.amt + v);
    pile.stack.push(v);
    restart(el, 'pressed');
    flyCoin(el, document.querySelector('.goal-hero .jar-body'));
    CQ.sfx('coin'); CQ.buzz(10);
    updatePile(g);
  };
  A['coin-undo'] = function (el) {
    const g = CQ.goal(el.dataset.goal), pile = CQ.pile;
    if (!pile.stack.length) return;
    pile.amt = CQ.round2(pile.amt - pile.stack.pop());
    updatePile(g);
  };
  A['coin-save'] = function (el) {
    const g = CQ.goal(el.dataset.goal), amt = CQ.pile.amt;
    if (!g || !(amt > 0)) return;
    CQ.pile = { goal: g.id, amt: 0, stack: [] };
    CQ.saveToJar(g, amt);
  };

  /* ---------- Guided tour (spotlight + tips) ---------- */
  CQ.TOUR = [
    { sel: '.wallet .wallet-main', t: 'This is your wallet 💰 — the money you can spend right now.' },
    { sel: '.wallet a.wallet-card', t: 'Money you save goes into jars 🫙 so you don\'t spend it by accident.' },
    { sel: '.quick', t: 'Got money, or spent some? Tap these to write it down. ✍️' },
    { sel: '.chest-card', t: 'Open a treasure chest every day for bonus XP! 🎁' },
    { sel: '.world-card.w1', t: 'Track: see where all your money went — with charts! 📊' },
    { sel: '.world-card.w2', t: 'Save: save up for something you really want. 🫙' },
    { sel: '.world-card.w3', t: 'Decide: want to buy something? Do a quick Think First check, then ask your parents! 🛍️' },
    { sel: '.tip-card', t: 'Tap “Next” for more money points. Every section has its own! 💡' },
    { sel: '.tile[href="#/learn"]', t: 'Learn: mini lessons, plus a guide to saving and investing. 📚' },
    { sel: '.mascot .mascot-face', t: 'Psst… try poking me. I\'m King Midas! 👑' },
    { sel: '.bottomnav', t: 'Jump between Track, Save, Decide and Learn down here.' },
    { sel: '.topbar a[href="#/settings"]', t: 'Settings: change your look, sounds, or add another player. ⚙️' },
  ];
  let tour = null;
  CQ.tourActive = () => !!tour;
  CQ.startTour = function () {
    if (CQ.parse().path !== 'home') { CQ.afterRender = () => setTimeout(CQ.startTour, 300); CQ.go('home'); return; }
    const steps = CQ.TOUR.filter((s) => document.querySelector(s.sel));
    if (!steps.length) return;
    tour = { steps, i: 0 };
    document.body.classList.add('no-scroll');
    showStep();
  };
  function showStep() {
    const root = document.getElementById('tour-root');
    const step = tour.steps[tour.i], el = document.querySelector(step.sel);
    if (!el) { CQ.endTour(); return; }
    const fixed = getComputedStyle(el).position === 'fixed' || el.closest('.topbar, .bottomnav');
    if (!fixed) {
      const r0 = el.getBoundingClientRect();
      window.scrollBy(0, r0.top + r0.height / 2 - window.innerHeight / 2);
    }
    const r = el.getBoundingClientRect(), pad = 6, last = tour.i === tour.steps.length - 1;
    const text = esc(step.t);
    const below = r.bottom + 190 < window.innerHeight;
    const tipPos = below ? 'top:' + Math.round(r.bottom + pad + 12) + 'px' : 'bottom:' + Math.round(window.innerHeight - r.top + pad + 12) + 'px';
    root.innerHTML = '<div class="tour-block" data-act="tour-next" data-quiet="1"></div>' +
      '<div class="tour-spot" style="top:' + (r.top - pad) + 'px;left:' + (r.left - pad) + 'px;width:' + (r.width + pad * 2) + 'px;height:' + (r.height + pad * 2) + 'px"></div>' +
      '<div class="tour-tip" role="dialog" aria-live="polite" style="' + tipPos + '"><div class="tour-face" aria-hidden="true">' + CQ.goldsworth() + '</div><p>' + text + '</p>' +
      '<div class="tour-row"><button class="link-btn" data-act="tour-end">Skip tour</button><span class="tiny muted">' + (tour.i + 1) + ' / ' + tour.steps.length + '</span>' +
      '<button class="btn btn-primary btn-small" data-act="tour-next" data-quiet="1" autofocus>' + (last ? 'Let\'s play! 🚀' : 'Next →') + '</button></div></div>';
    const btn = root.querySelector('[autofocus]');
    if (btn) btn.focus();
    CQ.sfx('pop');
  }
  CQ.endTour = function () {
    if (!tour) return;
    tour = null;
    document.getElementById('tour-root').innerHTML = '';
    if (!CQ.modalOpen) document.body.classList.remove('no-scroll');
    const c = CQ.child();
    if (c && !c.tourDone) { c.tourDone = true; CQ.save(); }
  };
  A['tour-start'] = () => CQ.startTour();
  A['tour-next'] = function () {
    if (!tour) return;
    tour.i++;
    if (tour.i >= tour.steps.length) { CQ.endTour(); window.scrollTo(0, 0); CQ.sfx('win'); CQ.confetti(); return; }
    showStep();
  };
  A['tour-end'] = () => CQ.endTour();
  window.addEventListener('resize', () => { if (tour) showStep(); });
  document.addEventListener('keydown', (e) => {
    if (!tour) return;
    if (e.key === 'Escape') CQ.endTour();
  });
})();
