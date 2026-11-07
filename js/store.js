/* MyMoney — data store (saved on this device with localStorage) and money maths. */
(function () {
  const CQ = (window.CQ = window.CQ || {});
  const KEY = 'pennypath.v1'; // kept from the app's old name so saved progress isn't lost
  const DAY = 86400000;
  CQ.DAY = DAY;
  CQ.uid = () => Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);

  let state = null;
  CQ.state = () => state;
  CQ.setState = (s) => { state = s; CQ.save(); };

  CQ.load = function () {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s && s.version === 1) { state = s; return state; }
      }
    } catch (e) { console.warn('MyMoney: could not read saved data', e); }
    // First launch: nothing saved yet, so start from zero and show the sign-up.
    // (Not saved until the account is created.)
    state = CQ.emptyState();
    return state;
  };

  CQ.save = function () {
    try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
    catch (e) {
      console.warn('MyMoney: could not save', e);
      if (CQ.toast) CQ.toast('Could not save — device storage may be full.', 'warn');
      return false;
    }
  };

  CQ.emptyState = (settings) => ({
    version: 1,
    settings: Object.assign({ currency: 'INR', sound: true }, settings || {}),
    activeChildId: null,
    children: [], transactions: [], goals: [], requests: [],
  });

  /* ---------------- Lookups ---------------- */
  CQ.child = function (id) {
    if (!state || !state.children.length) return null;
    return state.children.find((c) => c.id === (id || state.activeChildId)) || state.children[0];
  };
  CQ.goal = (id) => state.goals.find((g) => g.id === id);
  CQ.request = (id) => state.requests.find((r) => r.id === id);
  CQ.time = (t) => new Date(t.date || t).getTime();

  CQ.txFor = (childId) => state.transactions.filter((t) => t.childId === childId).sort((a, b) => CQ.time(a) - CQ.time(b));
  CQ.txDelta = (t) => (t.type === 'in' || t.type === 'withdraw' ? t.amount : -t.amount);
  CQ.balance = (childId) => round2(CQ.txFor(childId).reduce((b, t) => b + CQ.txDelta(t), 0));
  CQ.goalSaved = (g) => round2(state.transactions.filter((t) => t.goalId === g.id)
    .reduce((s, t) => s + (t.type === 'save' ? t.amount : t.type === 'withdraw' ? -t.amount : 0), 0));
  CQ.goalsFor = (childId, includeDone) => state.goals
    .filter((g) => g.childId === childId && (includeDone || g.status === 'active'))
    .sort((a, b) => a.priority - b.priority);

  CQ.txSince = (childId, type, days) => {
    const since = Date.now() - days * DAY;
    return state.transactions.filter((t) => t.childId === childId && t.type === type && CQ.time(t) >= since);
  };
  CQ.spendingIn = (childId, days) => CQ.txSince(childId, 'out', days);
  CQ.sum = (list) => round2(list.reduce((s, t) => s + t.amount, 0));
  CQ.byCategory = (list) => {
    const m = {};
    list.forEach((t) => { m[t.category] = (m[t.category] || 0) + t.amount; });
    return CQ.CATEGORIES.map((c) => Object.assign({}, c, { total: round2(m[c.id] || 0) }))
      .filter((c) => c.total > 0).sort((a, b) => b.total - a.total);
  };

  function round2(n) { return Math.round(n * 100) / 100; }
  CQ.round2 = round2;
  CQ.niceUp = (n) => (n >= 100 ? Math.ceil(n / 10) * 10 : Math.ceil(n));

  CQ.goalPlan = function (g) {
    const saved = CQ.goalSaved(g);
    const left = round2(Math.max(0, g.price - saved));
    const pct = Math.min(100, Math.floor((saved / g.price) * 100));
    let weeks = null, perWeek = 0, overdue = false;
    if (g.targetDate) {
      const ms = new Date(g.targetDate + 'T23:59:59').getTime() - Date.now();
      overdue = ms < 0;
      weeks = Math.max(1, Math.ceil(ms / (7 * DAY)));
      perWeek = left > 0 ? CQ.niceUp(left / weeks) : 0;
    }
    return { saved, left, pct, weeks, perWeek, overdue };
  };

  CQ.snackCost = function (childId) {
    const food = CQ.spendingIn(childId, 30).filter((t) => t.category === 'food');
    if (food.length) return Math.round(CQ.sum(food) / food.length);
    return CQ.currency().snack;
  };

  /* Streak = weeks in a row (Mon–Sun) with at least one deposit into a goal jar. */
  function weekIndex(d) { const base = new Date(1970, 0, 5).getTime(); return Math.floor((d.getTime() - base) / (7 * DAY)); }
  CQ.saveStreak = function (childId) {
    const weeks = new Set(state.transactions.filter((t) => t.childId === childId && t.type === 'save').map((t) => weekIndex(new Date(t.date))));
    let w = weekIndex(new Date());
    if (!weeks.has(w)) w--;
    let n = 0;
    while (weeks.has(w)) { n++; w--; }
    return n;
  };

  CQ.addTx = function (t) {
    t.id = t.id || CQ.uid();
    t.date = t.date || new Date().toISOString();
    t.amount = round2(t.amount);
    state.transactions.push(t);
    return t;
  };

  /* ---------------- XP, levels, badges ---------------- */
  CQ.levelOf = (xp) => Math.floor(xp / CQ.XP_PER_LEVEL) + 1;
  CQ.levelTier = (lvl) => CQ.LEVELS[Math.max(0, Math.min(lvl - 1, CQ.LEVELS.length - 1))];
  CQ.levelName = (lvl) => CQ.levelTier(lvl).name;
  // A shiny rank chip, e.g. "🥇 Gold"
  CQ.rankChip = (lvl) => { const t = CQ.levelTier(lvl); return '<span class="rank-chip rank-' + t.cls + '">' + t.emoji + ' ' + t.name + '</span>'; };

  CQ.addXP = function (child, amount, why, opts) {
    if (!amount) return;
    const before = CQ.levelOf(child.xp);
    child.xp += amount;
    const silent = opts && opts.silent, quiet = opts && opts.quiet; // quiet = no toast, but level-ups still celebrate
    if (!silent && !quiet && CQ.toast) CQ.toast('+' + amount + ' XP' + (why ? ' · ' + why : ''), 'xp');
    const after = CQ.levelOf(child.xp);
    if (after > before && !silent) {
      const t = CQ.levelTier(after), newRank = CQ.levelTier(before).name !== t.name;
      CQ.celebrate({ emoji: t.emoji, title: newRank ? t.name + ' rank!' : 'Level ' + after + '!',
        text: newRank ? 'You dug up ' + t.name + '! You\'re now level ' + after + '. Keep going!' : 'Still ' + t.name + ', and getting richer. Keep going!', sound: 'levelup' });
    }
  };
  CQ.hasBadge = (child, id) => child.badges.some((b) => b.id === id);
  CQ.giveBadge = function (child, id, opts) {
    if (CQ.hasBadge(child, id)) return false;
    const b = CQ.BADGES.find((x) => x.id === id);
    if (!b) return false;
    child.badges.push({ id, date: new Date().toISOString() });
    if (!(opts && opts.silent)) CQ.celebrate({ emoji: b.emoji, title: 'New badge: ' + b.name, text: b.desc });
    return true;
  };
  CQ.checkBadges = function (child, opts) {
    const outs = state.transactions.filter((t) => t.childId === child.id && t.type === 'out').length;
    if (outs >= 1) CQ.giveBadge(child, 'first_log', opts);
    if (outs >= 10) CQ.giveBadge(child, 'tracker_10', opts);
    if (state.goals.some((g) => g.childId === child.id)) CQ.giveBadge(child, 'first_goal', opts);
    if (CQ.saveStreak(child.id) >= 3) CQ.giveBadge(child, 'streak3', opts);
    if (Object.keys(child.lessons || {}).length >= 3) CQ.giveBadge(child, 'scholar', opts);
    const investLessons = CQ.LESSONS.filter((l) => l.world === 'invest');
    if (investLessons.length && investLessons.every((l) => (child.lessons || {})[l.id] != null)) CQ.giveBadge(child, 'investor', opts);
  };

  CQ.checkMilestones = function (goal) {
    const child = CQ.child(goal.childId);
    const pct = (CQ.goalSaved(goal) / goal.price) * 100;
    const msgs = { 25: 'A quarter of the way there!', 50: 'Halfway there! 🎉', 75: 'Almost there — just a little more!', 100: 'You did it! Your goal jar is full!' };
    [25, 50, 75, 100].forEach((m) => {
      if (pct >= m && goal.milestones.indexOf(m) === -1) {
        goal.milestones.push(m);
        CQ.celebrate({ emoji: goal.emoji || '🎯', title: m + '% of ' + goal.name, text: msgs[m], sound: m === 100 ? 'kaching' : 'win' });
        CQ.giveBadge(child, 'm' + m);
        CQ.addXP(child, m === 100 ? 50 : 15, m + '% milestone');
      }
    });
  };

  /* ---------------- Dates ---------------- */
  const pad = (n) => String(n).padStart(2, '0');
  CQ.dateInput = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  CQ.today = () => CQ.dateInput(new Date());
  CQ.fromDateInput = function (v) {
    if (!v || v === CQ.today()) return new Date().toISOString();
    const [y, m, d] = v.split('-').map(Number);
    return new Date(y, m - 1, d, 12, 0, 0).toISOString();
  };
})();
