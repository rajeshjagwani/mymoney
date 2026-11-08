/* MyMoney — kid & teen screens: home, the three worlds, lessons, rewards, profiles. */
(function () {
  const CQ = window.CQ;
  const R = CQ.routes, A = CQ.actions, F = CQ.forms, I = CQ.inputs, C = CQ.changes;
  const esc = CQ.esc, money = CQ.money;
  const S = () => CQ.state();
  const kid = () => CQ.child();
  const W = CQ.WORLDS;

  const STATUS = {
    cooling: ['⏳ Waiting 48h', 'sun'],
    ready: ['⏳ Time to decide', 'sun'],
    bought: ['🛍️ Bought', 'green'],
    skipped: ['🙅 Skipped', ''],
  };
  const isReady = (r) => r.status === 'cooling' && new Date(r.waitUntil).getTime() <= Date.now();
  const statusPill = (r) => {
    const st = STATUS[isReady(r) ? 'ready' : r.status] || ['', ''];
    const refl = r.status === 'bought' && r.reflection ? (r.reflection === 'good' ? ' 👍' : ' 😕') : '';
    return '<span class="pill ' + st[1] + '">' + st[0] + refl + '</span>';
  };
  const reqPic = (r) => '<div class="req-pic">' + CQ.cat(r.category).emoji + '</div>';
  CQ.reqPic = reqPic; CQ.statusPill = statusPill;

  function askTitle() { return W.ask.title; }
  // Big link card to Midas's Golden Rules, showing how many tips you've read.
  function vaultLink() {
    const c = kid(), n = (c.tipsRead || []).length;
    const total = CQ.POINT_SECTIONS.reduce((t, s) => t + (CQ.POINTS[s.key] || []).length, 0);
    return '<a class="card vault-link" href="#/tips"><span class="vl-emoji">💡</span><span><b>Midas\'s Golden Rules</b><br><span class="muted">' + total + ' money tips · ' + n + ' read</span></span><span class="vl-go">Open →</span></a>';
  }
  CQ.vaultLink = vaultLink;

  /* =========================== HOME =========================== */
  R.home = function () {
    const s = S(), c = kid();
    const bal = CQ.balance(c.id);
    const goals = CQ.goalsFor(c.id);
    const inJars = goals.reduce((t, g) => t + CQ.goalSaved(g), 0);
    const lvl = CQ.levelOf(c.xp), into = c.xp % CQ.XP_PER_LEVEL;
    const streak = CQ.saveStreak(c.id);
    const spent7 = CQ.sum(CQ.spendingIn(c.id, 7));
    const top = goals[0], plan = top && CQ.goalPlan(top);
    const reqs = s.requests.filter((r) => r.childId === c.id);
    const waiting = reqs.filter((r) => r.status === 'cooling').length;
    const tips = CQ.TIPS[c.mode];
    const tip = CQ.fill(tips[new Date().getDate() % tips.length]);

    const news = reqs.filter(isReady).map((r) =>
      '<a class="notice wait" href="#/ask/req?id=' + r.id + '"><span class="n-emoji">⏳</span><span>Your 48 hours are up for <b>' + esc(r.item) + '</b>. Still want it?</span></a>').join('');

    const body =
      '<section class="card hero"><div class="hero-top"><div class="hero-avatar" aria-hidden="true">' + CQ.avatar(c.avatar) + '</div><div><p class="hero-hi">Hi ' + esc(c.name) + '!</p>' +
      '<h2 class="hero-level">Level ' + lvl + ' ' + CQ.rankChip(lvl) + '</h2></div>' +
      '<a class="streak" href="#/rewards" aria-label="Saving streak: ' + streak + ' weeks">🔥' + streak + '<small>' + (streak === 1 ? 'week' : 'weeks') + '</small></a></div>' +
      CQ.progress(Math.round((into / CQ.XP_PER_LEVEL) * 100), 'xp') +
      '<p class="tiny muted">' + c.xp + ' XP · ' + (CQ.XP_PER_LEVEL - into) + ' XP to level ' + (lvl + 1) + '</p></section>' +
      '<section class="wallet"><div class="wallet-card wallet-main"><span class="label">' + CQ.t('💰 My wallet', '💰 Available to spend') + '</span><strong data-count="' + bal + '" data-key="wallet-' + c.id + '">' + money(bal) + '</strong></div>' +
      '<a class="wallet-card" href="#/save" style="text-decoration:none;color:inherit"><span class="label">' + CQ.t('🫙 In my jars', '🫙 Saved in goals') + '</span><strong data-count="' + inJars + '" data-key="jars-' + c.id + '">' + money(inJars) + '</strong></a></section>' +
      '<div class="quick"><a class="btn btn-green btn-big" href="#/spend/in">＋ ' + CQ.t('Money in', 'Add income') + '</a>' +
      '<a class="btn btn-coral btn-big" href="#/spend/out">－ ' + CQ.t('I spent', 'Log a spend') + '</a></div>' +
      news +
      CQ.mascot('🦉', tip) +
      '<h2 class="section-title">' + CQ.t('Your three quests', 'Track, save & decide') + '</h2>' +
      '<div class="worlds">' +
      '<a class="world-card w1" href="#/spend"><span class="world-num">📊 Track</span><span class="world-mascot" aria-hidden="true">' + CQ.goldsworth() + '<i class="prop">' + W.spend.prop + '</i></span><h3>' + W.spend.title + '</h3>' +
      '<p>' + money(spent7) + ' spent in the last 7 days</p></a>' +
      '<a class="world-card w2" href="#/save"><span class="world-num">🫙 Save</span><span class="world-mascot" aria-hidden="true">' + CQ.goldsworth() + '<i class="prop">' + W.save.prop + '</i></span><h3>' + W.save.title + '</h3>' +
      (top ? '<p>' + esc(top.name) + ': ' + plan.pct + '%</p>' + CQ.progress(plan.pct, 'green') : '<p>Pick something to save for!</p>') + '</a>' +
      '<a class="world-card w3" href="#/ask"><span class="world-num">🛍️ Decide</span><span class="world-mascot" aria-hidden="true">' + CQ.goldsworth() + '<i class="prop">' + W.ask.prop + '</i></span><h3>' + askTitle() + '</h3>' +
      '<p>' + (waiting ? CQ.plural(waiting, 'thing') + ' on a 48-hour wait' : 'Think first, then ask your parents') + '</p></a>' +
      '</div>' + CQ.tipCard('home') +
      '<div class="tiles"><a class="tile" href="#/learn"><span class="t-emoji">📚</span>Mini lessons<span class="tiny muted">2 minutes each</span></a>' +
      '<a class="tile" href="#/rewards"><span class="t-emoji">🏅</span>My badges<span class="tiny muted">' + c.badges.length + ' of ' + CQ.BADGES.length + ' earned</span></a></div>' +
      '<button class="btn btn-ghost btn-block" data-act="tour-start">🧭 Take the tour</button>';
    // New players get the tour once, automatically.
    if (!c.tourDone && !CQ.tourActive()) {
      CQ.afterRender = () => setTimeout(() => { if (CQ.parse().path === 'home' && !CQ.modalOpen && !CQ.tourActive()) CQ.startTour(); }, 700);
    }
    return CQ.shell(body, { tab: 'home', title: '🪙 MyMoney' });
  };

  /* =========================== WORLD 1 — SPENDING =========================== */
  const spendTabs = (active) => CQ.tabs([['spend', '📊 Overview', 'overview'], ['spend/timeline', '🧾 Timeline', 'timeline'], ['spend/quiz', '🔮 Quiz', 'quiz']], active);
  const spendButtons = '<div class="quick"><a class="btn btn-green" href="#/spend/in">＋ ' + 'Money in' + '</a><a class="btn btn-coral" href="#/spend/out">－ Log a buy</a></div>';

  CQ.insights = function (childId, days) {
    const list = CQ.spendingIn(childId, days);
    if (!list.length) return [];
    const total = CQ.sum(list), cats = CQ.byCategory(list), top = cats[0];
    const pct = Math.round((top.total / total) * 100);
    const period = days === 7 ? CQ.t('this week', 'in the last 7 days') : CQ.t('this month', 'in the last 30 days');
    const out = [];
    let first = 'You spent <b>' + money(top.total) + '</b> on ' + top.name.toLowerCase() + ' ' + period + '. That\'s <b>' + pct + '%</b> of your spending!';
    if (!CQ.isTeen() && pct >= 10) first += ' (About ' + Math.round(pct / 10) + ' out of every 10 coins.)';
    out.push([top.emoji, first]);
    const now = Date.now();
    const prev = CQ.sum(S().transactions.filter((t) => t.childId === childId && t.type === 'out' &&
      CQ.time(t) >= now - 2 * days * CQ.DAY && CQ.time(t) < now - days * CQ.DAY));
    if (prev > 0) {
      const diff = CQ.round2(total - prev);
      if (diff < 0) out.push(['🎉', 'You spent <b>' + money(-diff) + ' less</b> than the ' + days + ' days before. Nice!']);
      else if (diff > 0) out.push(['📈', 'You spent <b>' + money(diff) + ' more</b> than the ' + days + ' days before.']);
    }
    const food = list.filter((t) => t.category === 'food');
    if (food.length >= 3) out.push(['🍬', CQ.t(food.length + ' snack buys added up to <b>' + money(CQ.sum(food)) + '</b>. Small buys add up!',
      food.length + ' food buys = <b>' + money(CQ.sum(food)) + '</b>, about ' + money(Math.round(CQ.sum(food) / food.length)) + ' each. Small buys add up.')]);
    const big = list.reduce((m, t) => (t.amount > m.amount ? t : m), list[0]);
    out.push(['💸', 'Biggest buy: <b>' + esc(big.note || CQ.cat(big.category).name) + '</b> for ' + money(big.amount) + '.']);
    const income = CQ.sum(CQ.txSince(childId, 'in', days)), saved = CQ.sum(CQ.txSince(childId, 'save', days));
    if (income > 0) out.push(['🐷', 'You got ' + money(income) + ' and put ' + money(saved) + ' in your jars — that\'s <b>' + Math.round((saved / income) * 100) + '% saved</b>.']);
    return out;
  };

  R.spend = function (p) {
    const c = kid(), days = p.p === '7' ? 7 : 30;
    const list = CQ.spendingIn(c.id, days), cats = CQ.byCategory(list), total = CQ.sum(list);
    const seg = '<div class="seg"><a href="#/spend?p=7"' + (days === 7 ? ' class="active"' : '') + '>7 days</a><a href="#/spend?p=30"' + (days === 30 ? ' class="active"' : '') + '>30 days</a></div>';
    let body = CQ.mascot('🦉', CQ.t("Good day! I'm King Midas 👑 Let's find out where your money went. 🔍", 'Where did it all go? Here is the breakdown.')) + spendTabs('overview') + spendButtons;
    if (!list.length) {
      body += '<div class="card-head"><span></span>' + seg + '</div>' + CQ.empty('🕵️', 'No spending yet', 'Nothing spent in the last ' + days + ' days. Log a buy to see your charts.', '<a class="btn btn-coral" href="#/spend/out">Log a buy</a>');
    } else {
      body += '<section class="card"><div class="card-head"><h3>Where it went</h3>' + seg + '</div><div class="chart-wrap">' +
        CQ.donut(cats, money(total), days === 7 ? 'last 7 days' : 'last 30 days') + CQ.legend(cats) + '</div></section>' +
        '<section class="card"><h3>📊 Spending by category</h3>' + CQ.bars(cats) + '</section>' +
        '<section class="card"><h3>🧐 What King Midas noticed</h3><ul class="insights">' +
        CQ.insights(c.id, days).map(([e, t]) => '<li><span class="i-emoji">' + e + '</span><span>' + t + '</span></li>').join('') + '</ul></section>';
    }
    body += CQ.tipCard('spend') + '<a class="card" href="#/learn" style="text-decoration:none;color:inherit">📚 <b>Mini lesson:</b> Every coin tells a story →</a>';
    return CQ.shell(body, { tab: 'spend', title: '📊 ' + W.spend.title, world: 'w1' });
  };

  R['spend/timeline'] = function () {
    const c = kid();
    let run = 0;
    const rows = CQ.txFor(c.id).map((t) => { run = CQ.round2(run + CQ.txDelta(t)); return { t, run }; }).reverse();
    let body = CQ.guide('🦉', 'Here is every coin in and out, newest first. The small number shows what was left in your wallet after.') + spendTabs('timeline') + spendButtons;
    if (!rows.length) return CQ.shell(body + CQ.empty('🧾', 'Nothing here yet', 'Add money or log a buy to start your timeline.'), { tab: 'spend', title: '🧾 Money timeline', world: 'w1' });
    let html = '', day = '';
    rows.forEach(({ t, run }) => {
      const d = CQ.dayLabel(t.date);
      if (d !== day) { html += '<div class="tl-day">' + d + '</div>'; day = d; }
      let icon, title, cls, sign, bg;
      if (t.type === 'in') { const s = CQ.src(t.source); icon = s.emoji; title = CQ.srcName(s); cls = 'pos'; sign = '+'; bg = 'var(--w2-l)'; }
      else if (t.type === 'out') { const k = CQ.cat(t.category); icon = k.emoji; title = k.name; cls = 'neg'; sign = '−'; bg = k.color + '22'; }
      else if (t.type === 'save') { icon = '🫙'; title = 'Into jar: ' + esc(t.goalName || 'goal'); cls = 'jar'; sign = '−'; bg = 'var(--sun-l)'; }
      else { icon = '↩️'; title = 'Back from jar: ' + esc(t.goalName || 'goal'); cls = 'jar'; sign = '+'; bg = 'var(--sun-l)'; }
      const pic = '<div class="tl-icon" style="background:' + bg + '">' + icon + '</div>';
      html += '<div class="tl-item">' + pic + '<div class="tl-main"><span class="tl-title">' + title + '</span>' +
        (t.note ? '<span class="tl-note">' + esc(t.note) + '</span>' : '') + '</div>' +
        '<div class="tl-right"><span class="tl-amt ' + cls + '">' + sign + money(t.amount) + '</span><span class="tl-bal">= ' + money(run) + '</span>' +
        '<span class="tl-tools"><button data-act="del-tx" data-id="' + t.id + '" aria-label="Delete this entry" title="Delete">🗑️</button></span></div></div>';
    });
    body += '<section class="card"><div class="card-head"><h3>Wallet now</h3><span class="big-number">' + money(CQ.balance(c.id)) + '</span></div>' + html + '</section>';
    return CQ.shell(body, { tab: 'spend', title: '🧾 Money timeline', world: 'w1' });
  };

  A['del-tx'] = function (el) {
    const t = S().transactions.find((x) => x.id === el.dataset.id);
    if (!t) return;
    CQ.ask('Delete this entry? This can\'t be undone.', 'Yes, delete it', () => {
      S().transactions = S().transactions.filter((x) => x.id !== t.id);
      CQ.save(); CQ.toast('Deleted'); CQ.refresh();
    }, { emoji: '🗑️', danger: true });
  };

  R['spend/in'] = function () {
    const body = CQ.guide('🦉', 'Yay, money! 🎉 Where did it come from?') +
      '<form class="card form" data-form="add-in">' + CQ.amountField('amount', 'How much?', null, ' autofocus') +
      '<fieldset><legend>Where from?</legend><div class="chips">' + CQ.SOURCES.map((s, i) => CQ.chip('source', s.id, s.emoji + ' ' + CQ.srcName(s), i === 0)).join('') + '</div></fieldset>' +
      '<label class="field"><span>Note <span class="muted">(optional)</span></span><input name="note" maxlength="60" placeholder="' + CQ.t('e.g. From Grandma', 'e.g. Tutoring, 4 sessions') + '"></label>' +
      '<label class="field"><span>Date</span><input type="date" name="date" value="' + CQ.today() + '" max="' + CQ.today() + '"></label>' +
      '<button class="btn btn-green btn-block btn-big">Add money 💰</button></form>' + CQ.tipCard('earn');
    return CQ.shell(body, { back: 'spend', tab: 'spend', title: '💰 Money in', world: 'w1' });
  };
  F['add-in'] = function (form, fd) {
    const c = kid(), amount = parseFloat(fd.get('amount'));
    if (!(amount > 0)) return CQ.toast('Type an amount first', 'warn');
    CQ.addTx({ childId: c.id, type: 'in', amount, source: fd.get('source'), note: (fd.get('note') || '').trim(), date: CQ.fromDateInput(fd.get('date')) });
    CQ.addXP(c, 5, 'money added');
    CQ.sfx('kaching'); CQ.buzz([30, 40, 60]);
    const btn = form.querySelector('.btn'), r = btn && btn.getBoundingClientRect();
    if (r) CQ.burst(r.left + r.width / 2, r.top + r.height / 2, ['💵', '💰', '🪙']);
    CQ.save();
    CQ.go('spend/timeline');
  };

  R['spend/out'] = function () {
    const body = CQ.guide('🦉', 'What did you buy? Writing it down makes you a money detective! 🔍') +
      '<form class="card form" data-form="add-out">' + CQ.amountField('amount', 'How much did it cost?', null, ' autofocus') +
      '<fieldset><legend>What kind of thing?</legend><div class="chips">' + CQ.CATEGORIES.map((k, i) => CQ.chip('category', k.id, k.emoji + ' ' + k.name, i === 0)).join('') + '</div></fieldset>' +
      '<label class="field"><span>What was it? <span class="muted">(optional)</span></span><input name="note" maxlength="60" placeholder="' + CQ.t('e.g. Ice cream', 'e.g. Food delivery') + '"></label>' +
      '<label class="field"><span>Date</span><input type="date" name="date" value="' + CQ.today() + '" max="' + CQ.today() + '"></label>' +
      '<button class="btn btn-coral btn-block btn-big">Log it 📝</button></form>' + CQ.tipCard('spend');
    return CQ.shell(body, { back: 'spend', tab: 'spend', title: '📝 Log a buy', world: 'w1' });
  };
  F['add-out'] = function (form, fd) {
    const c = kid(), amount = parseFloat(fd.get('amount'));
    if (!(amount > 0)) return CQ.toast('Type an amount first', 'warn');
    const bal = CQ.balance(c.id);
    const log = () => {
      CQ.addTx({ childId: c.id, type: 'out', amount, category: fd.get('category'), note: (fd.get('note') || '').trim(), date: CQ.fromDateInput(fd.get('date')) });
      CQ.addXP(c, 5, 'buy logged');
      CQ.sfx('spend');
      CQ.checkBadges(c);
      CQ.save();
      CQ.go('spend/timeline');
    };
    if (amount > bal + 1e-9) return CQ.notEnough(bal, amount); // can't spend more than the wallet holds
    log();
  };

  R['spend/quiz'] = function (p) {
    const c = kid(), list = CQ.spendingIn(c.id, 30), cats = CQ.byCategory(list);
    let body = spendTabs('quiz');
    if (!list.length) return CQ.shell(body + CQ.empty('🔮', 'Nothing to guess yet', 'Log some buys first, then come back for the quiz.'), { tab: 'spend', title: '🔮 Guess quiz', world: 'w1' });
    if (p.g) {
      const top = cats[0], right = p.g === top.id, g = CQ.cat(p.g);
      body += '<div class="result-banner ' + (right ? 'right' : 'wrong') + '"><div class="big-emoji">' + (right ? '🎉' : '🤔') + '</div><h2>' +
        (right ? 'You got it!' : 'Not quite!') + '</h2><p>You guessed ' + g.emoji + ' <b>' + g.name + '</b>. Your top category was ' + top.emoji + ' <b>' + top.name + '</b> (' + money(top.total) + ').</p></div>' +
        '<section class="card"><h3>Last 30 days</h3>' + CQ.bars(cats) + '</section><a class="btn btn-blue btn-block" href="#/spend">See all my charts</a>';
    } else {
      body += CQ.mascot('🦉', "Quick quiz! Which did you spend the <b>most</b> on in the last 30 days? Make your guess…") +
        '<div class="guess-grid">' + CQ.CATEGORIES.map((k) => '<button class="guess-btn" data-act="quiz-guess" data-cat="' + k.id + '"><span class="g-emoji">' + k.emoji + '</span>' + k.name + '</button>').join('') + '</div>';
    }
    return CQ.shell(body, { tab: 'spend', title: '🔮 Guess quiz', world: 'w1' });
  };
  A['quiz-guess'] = function (el) {
    const c = kid(), cats = CQ.byCategory(CQ.spendingIn(c.id, 30));
    const right = cats.length && cats[0].id === el.dataset.cat;
    if (c.quizDay !== CQ.today()) {
      c.quizDay = CQ.today();
      CQ.addXP(c, right ? 10 : 5, right ? 'great guess' : 'nice try');
    }
    if (right) CQ.giveBadge(c, 'guesser');
    CQ.save();
    CQ.go('spend/quiz?g=' + el.dataset.cat);
  };

  /* =========================== WORLD 2 — SAVING =========================== */
  function planText(g, plan) {
    if (plan.left <= 0) return 'Goal reached! 🎉';
    if (!g.targetDate) return money(plan.left) + ' to go';
    if (plan.overdue) return 'Target date has passed — pick a new one.';
    return 'Save <b>' + money(plan.perWeek) + '</b> a week for <b>' + CQ.plural(plan.weeks, 'week') + '</b> to get it!';
  }

  R.save = function () {
    const c = kid(), goals = CQ.goalsFor(c.id), done = S().goals.filter((g) => g.childId === c.id && g.status === 'done');
    let body = CQ.mascot('🐷', CQ.t('The secret of the rich? Saving up! 🎩 What are you saving for?', 'Pick a goal, set a date, and I\'ll work out the plan.'));
    if (!goals.length) body += CQ.empty('🫙', 'No goals yet', 'Think of something you really want — a cycle, headphones, a toy — and make it a goal!');
    goals.forEach((g, i) => {
      const plan = CQ.goalPlan(g);
      body += '<section class="card goal-card">' + (goals.length > 1 ? '<span class="goal-rank">#' + (i + 1) + '</span>' : '') +
        '<a href="#/save/goal?id=' + g.id + '" aria-label="Open ' + esc(g.name) + '">' + CQ.jar(plan.pct, g, 'small') + '</a>' +
        '<a class="goal-info" href="#/save/goal?id=' + g.id + '"><h3>' + esc(g.name) + '</h3><span class="muted">' + money(plan.saved) + ' of ' + money(g.price) + '</span>' +
        CQ.progress(plan.pct, 'green') + '<p class="tiny">' + planText(g, plan) + '</p></a>' +
        (goals.length > 1 ? '<div class="order-btns"><button data-act="goal-move" data-id="' + g.id + '" data-dir="-1" aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '>▲</button>' +
          '<button data-act="goal-move" data-id="' + g.id + '" data-dir="1" aria-label="Move down"' + (i === goals.length - 1 ? ' disabled' : '') + '>▼</button></div>' : '<span></span>') +
        '</section>';
    });
    if (goals.length > 1) body += '<button class="btn btn-ghost btn-block" data-act="chooser-start">🤔 Help me choose what comes first</button>';
    body += '<a class="btn btn-green btn-block btn-big" href="#/save/new">＋ New savings goal</a>' + CQ.tipCard('save') +
      '<a class="card" href="#/learn/guide" style="text-decoration:none;color:inherit">📘 <b>Money guide:</b> how to save and invest, step by step →</a>';
    if (CQ.isTeen()) body += '<a class="card" href="#/save/bank" style="text-decoration:none;color:inherit"><h3>🏦 How a bank savings account works</h3><p class="muted">Interest, compound growth and a calculator →</p></a>';
    if (done.length) body += '<section class="card"><h3>🏆 Goals I reached</h3>' + done.map((g) => '<div class="mini-goal">' + CQ.goalPic(g) + '<strong>' + esc(g.name) + '</strong><span class="muted tiny">' + money(g.price) + '</span></div>').join('') + '</section>';
    return CQ.shell(body, { tab: 'save', title: '🫙 ' + W.save.title, world: 'w2' });
  };

  A['goal-move'] = function (el) {
    const c = kid(), goals = CQ.goalsFor(c.id), i = goals.findIndex((g) => g.id === el.dataset.id), j = i + Number(el.dataset.dir);
    if (i < 0 || j < 0 || j >= goals.length) return;
    const tmp = goals[i]; goals[i] = goals[j]; goals[j] = tmp;
    goals.forEach((g, k) => { g.priority = k; });
    CQ.save(); CQ.refresh();
  };

  /* "Help me choose": compare goals two at a time, most wins goes first. */
  A['chooser-start'] = function () {
    const ids = CQ.goalsFor(kid().id).slice(0, 5).map((g) => g.id), pairs = [];
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) pairs.push([ids[i], ids[j]]);
    CQ.chooser = { ids, pairs, i: 0, wins: {} };
    showChooser();
  };
  function showChooser() {
    const ch = CQ.chooser;
    if (ch.i >= ch.pairs.length) return finishChooser();
    const btn = (g) => { const p = CQ.goalPlan(g); return '<button class="vs-btn" data-act="chooser-pick" data-id="' + g.id + '">' + CQ.goalPic(g) + '<strong>' + esc(g.name) + '</strong><small>' + money(p.left) + ' to go</small></button>'; };
    const [a, b] = ch.pairs[ch.i].map(CQ.goal);
    CQ.openModal('<h2>' + CQ.t('Which one would make you happier?', 'Which matters more to you right now?') + '</h2><p class="muted">Question ' + (ch.i + 1) + ' of ' + ch.pairs.length + '</p>' +
      '<div class="versus">' + btn(a) + '<span class="vs">or</span>' + btn(b) + '</div><button class="btn btn-ghost btn-block" data-act="close-modal">Cancel</button>');
  }
  A['chooser-pick'] = function (el) {
    const ch = CQ.chooser;
    ch.wins[el.dataset.id] = (ch.wins[el.dataset.id] || 0) + 1;
    ch.i++;
    showChooser();
  };
  function finishChooser() {
    const c = kid(), ch = CQ.chooser;
    const rest = CQ.goalsFor(c.id).filter((g) => ch.ids.indexOf(g.id) === -1);
    const ordered = ch.ids.map(CQ.goal).sort((a, b) => (ch.wins[b.id] || 0) - (ch.wins[a.id] || 0) || CQ.goalPlan(a).left - CQ.goalPlan(b).left).concat(rest);
    ordered.forEach((g, k) => { g.priority = k; });
    CQ.save();
    CQ.openModal('<div class="center"><div class="big-emoji">🏁</div><h2>Your order</h2></div><ol>' + ordered.map((g) => '<li><b>' + esc(g.name) + '</b></li>').join('') + '</ol>' +
      '<p class="muted">' + CQ.t('Tip: put most of your savings into #1 first. You will get it sooner!', 'Tip: focus most of your savings on #1 so it arrives sooner, then move on.') + '</p>' +
      '<button class="btn btn-primary btn-block" data-act="close-modal">Got it</button>');
    CQ.refresh();
  }

  function goalPreview(price, date) {
    if (!(price > 0)) return 'Type a price to see your plan.';
    if (!date) return 'Add a date and I\'ll tell you how much to save each week.';
    const ms = new Date(date + 'T23:59:59').getTime() - Date.now();
    if (ms <= 0) return 'Pick a date in the future.';
    const weeks = Math.max(1, Math.ceil(ms / (7 * CQ.DAY))), per = CQ.niceUp(price / weeks);
    return '💰 Save <b>' + money(per) + '</b> a week for <b>' + CQ.plural(weeks, 'week') + '</b> to get it! That\'s about ' + money(per / 7 >= 10 ? Math.ceil(per / 7) : Math.ceil((per / 7) * 100) / 100) + ' a day.';
  }
  R['save/new'] = function () {
    const d8 = CQ.dateInput(new Date(Date.now() + 56 * CQ.DAY)), tmr = CQ.dateInput(new Date(Date.now() + CQ.DAY));
    const body = CQ.guide('🐷', 'A new goal! Splendid! Give it a name and a picture so you remember why you\'re saving.') +
      '<form class="card form" data-form="new-goal" data-input="goal-preview">' +
      '<label class="field"><span>What are you saving for?</span><input name="name" required maxlength="40" autofocus placeholder="' + CQ.t('e.g. New cycle', 'e.g. Wireless headphones') + '"></label>' +
      '<fieldset><legend>Pick a picture</legend><div class="chips emoji-chips">' + CQ.GOAL_EMOJIS.map((e, i) => CQ.chip('emoji', e, e, i === 0)).join('') + '</div></fieldset>' +
      CQ.amountField('price', 'How much does it cost?') +
      '<label class="field"><span>When do you want it by? <span class="muted">(optional)</span></span><input type="date" name="targetDate" min="' + tmr + '" value="' + d8 + '"></label>' +
      '<div class="plan-preview" id="plan-preview">Type a price to see your plan.</div>' +
      '<button class="btn btn-green btn-block btn-big">Create goal 🎯</button></form>';
    return CQ.shell(body, { back: 'save', tab: 'save', title: '🎯 New goal', world: 'w2' });
  };
  I['goal-preview'] = function (form) {
    const out = document.getElementById('plan-preview');
    if (out) out.innerHTML = goalPreview(parseFloat(form.price.value), form.targetDate.value);
  };
  F['new-goal'] = function (form, fd) {
    const c = kid(), price = parseFloat(fd.get('price')), name = (fd.get('name') || '').trim();
    if (!name || !(price > 0)) return CQ.toast('Add a name and a price', 'warn');
    const goals = CQ.goalsFor(c.id);
    const g = { id: CQ.uid(), childId: c.id, name, emoji: fd.get('emoji') || '🎯', price: CQ.round2(price),
      targetDate: fd.get('targetDate') || null, priority: goals.length, createdAt: new Date().toISOString(), milestones: [], status: 'active' };
    S().goals.push(g);
    CQ.addXP(c, 15, 'new goal');
    CQ.giveBadge(c, 'first_goal');
    CQ.save();
    CQ.go('save/goal?id=' + g.id);
  };

  CQ.whatIf = function (left, base, snack, n) {
    const extra = n * snack;
    if (n === 0) return base > 0 ? 'At ' + money(base) + ' a week you reach your goal in <b>' + CQ.plural(Math.ceil(left / base), 'week') + '</b>. Slide to see what skipping snacks does!' : 'Slide to see how skipping snacks helps.';
    const wNew = Math.ceil(left / (base + extra));
    const what = 'skip <b>' + n + ' snack' + (n > 1 ? 's' : '') + ' a week</b> (' + money(extra) + ')';
    if (base > 0) {
      const wBase = Math.ceil(left / base), diff = wBase - wNew;
      if (diff > 0) return 'If you ' + what + ', you reach your goal <b>' + CQ.plural(diff, 'week') + ' sooner</b> — in ' + wNew + ' instead of ' + wBase + '! 🚀';
      return 'If you ' + what + ', you finish in about the same time (' + CQ.plural(wNew, 'week') + ') — with money to spare.';
    }
    return 'If you ' + what + ' and put it in your jar, you reach your goal in <b>' + CQ.plural(wNew, 'week') + '</b>.';
  };

  R['save/goal'] = function (p) {
    const c = kid(), g = CQ.goal(p.id);
    if (!g || g.childId !== c.id) return CQ.shell(CQ.empty('🤷', 'Goal not found', 'It may have been deleted.', '<a class="btn btn-green" href="#/save">Back to my goals</a>'), { back: 'save', tab: 'save', title: 'Goal', world: 'w2' });
    const plan = CQ.goalPlan(g), bal = CQ.balance(c.id), snack = CQ.snackCost(c.id);
    const icons = { 25: '🌱', 50: '🌿', 75: '🌳', 100: '🏆' };
    let body = '<section class="card goal-hero">' + CQ.jar(plan.pct, g) + '<h2 style="margin-top:12px">' + esc(g.name) + '</h2>' +
      '<p><b>' + money(plan.saved) + '</b> saved of ' + money(g.price) + (plan.left > 0 ? ' · <b>' + money(plan.left) + '</b> to go' : '') + '</p>' +
      '<div class="milestones">' + [25, 50, 75, 100].map((m) => '<div class="ms' + (g.milestones.indexOf(m) !== -1 ? ' on' : '') + '"><span>' + icons[m] + '</span><small>' + m + '%</small></div>').join('') + '</div>' +
      (g.status === 'active' && plan.left > 0
        ? (bal > 0 ? CQ.coinTray(g) : '<p class="info meh" style="margin-top:14px">Your wallet is empty. <a href="#/spend/in">Add money</a> first, then drop coins in here!</p>')
        : '') + '</section>';

    if (g.status === 'done') {
      body += CQ.empty('🏆', 'You got it!', 'You reached this goal. Amazing saving!');
      return CQ.shell(body, { back: 'save', tab: 'save', title: esc(g.name), world: 'w2' });
    }
    if (plan.left > 0) {
      body += CQ.mascot('🐷', planText(g, plan) + (g.targetDate ? '<br><span class="tiny muted">Target: ' + new Date(g.targetDate + 'T12:00').toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' }) + '</span>' : ''));
      if (bal > 0) {
        const quick = [plan.perWeek].filter((v) => v > 0 && v <= bal);
        body += '<details class="card"><summary><b>⌨️ Or type an amount</b> <span class="muted tiny">(wallet: ' + money(bal) + ')</span></summary>' +
          '<form class="form" data-form="jar-add" data-id="' + g.id + '" style="margin-top:12px">' +
          (quick.length ? '<div class="quick-amounts">' + quick.map((v) => '<button type="button" class="btn btn-ghost btn-small" data-act="set-amount" data-v="' + v + '">This week\'s plan: ' + money(v) + '</button>').join('') + '</div>' : '') +
          CQ.amountField('amount', 'How much?', null, ' max="' + bal + '"') + '<button class="btn btn-green btn-block btn-big">Put it in the jar 🪙</button></form></details>';
      }
      const n0 = 1;
      body += '<section class="card"><h3>🔮 What if…?</h3><label class="field"><span>Skip <output id="wi-n">' + n0 + '</output> snack(s) a week <span class="muted">(about ' + money(snack) + ' each)</span></span>' +
        '<input type="range" min="0" max="7" step="1" value="' + n0 + '" data-input="whatif" data-left="' + plan.left + '" data-base="' + plan.perWeek + '" data-snack="' + snack + '"></label>' +
        '<div class="plan-preview" id="wi-out">' + CQ.whatIf(plan.left, plan.perWeek, snack, n0) + '</div></section>';
      body += '<section class="card"><h3>📅 Change the date</h3><form class="form-row" data-form="goal-date" data-id="' + g.id + '"><label class="field"><span class="sr-only">Target date</span>' +
        '<input type="date" name="targetDate" value="' + (g.targetDate || '') + '" min="' + CQ.dateInput(new Date(Date.now() + CQ.DAY)) + '"></label><button class="btn btn-ghost">Update</button></form></section>';
    } else {
      body += '<section class="card center"><div class="big-emoji">🎉</div><h3>Your jar is full!</h3><p>Ready to get your ' + esc(g.name) + '? Tell us when you buy it.</p>' +
        '<form class="form" data-form="goal-bought" data-id="' + g.id + '"><fieldset><legend>What kind of thing is it?</legend><div class="chips" style="justify-content:center">' +
        CQ.CATEGORIES.map((k, i) => CQ.chip('category', k.id, k.emoji + ' ' + k.name, i === 2)).join('') + '</div></fieldset>' +
        '<button class="btn btn-green btn-block btn-big">🛍️ I bought it!</button></form></section>';
    }
    body += '<details class="card"><summary><b>More options</b></summary><div class="stack" style="margin-top:12px">' +
      (plan.saved > 0 ? '<form class="form-row" data-form="jar-out" data-id="' + g.id + '">' + CQ.amountField('amount', 'Take money out of the jar', null, ' max="' + plan.saved + '"') + '<button class="btn btn-ghost">Take out</button></form>' : '') +
      '<button class="btn btn-danger btn-block" data-act="goal-delete" data-id="' + g.id + '">🗑️ Delete this goal' + (plan.saved > 0 ? ' (money goes back to wallet)' : '') + '</button></div></details>';
    return CQ.shell(body, { back: 'save', tab: 'save', title: esc(g.name), world: 'w2' });
  };

  I.whatif = function (el) {
    const n = Number(el.value);
    document.getElementById('wi-n').textContent = n;
    document.getElementById('wi-out').innerHTML = CQ.whatIf(Number(el.dataset.left), Number(el.dataset.base), Number(el.dataset.snack), n);
  };
  A['set-amount'] = function (el) {
    const input = el.closest('form').querySelector('input[name=amount]');
    input.value = el.dataset.v;
    input.focus();
  };
  CQ.saveToJar = function (g, amount) {
    const c = kid(), bal = CQ.balance(c.id);
    if (!(amount > 0)) return CQ.toast('Type an amount', 'warn');
    if (amount > bal + 1e-9) return CQ.toast('You only have ' + money(bal) + ' in your wallet', 'warn');
    CQ.addTx({ childId: c.id, type: 'save', amount, goalId: g.id, goalName: g.name });
    CQ.sfx('jar');
    CQ.addXP(c, 10, 'saved ' + money(amount));
    CQ.checkMilestones(g);
    CQ.checkBadges(c);
    CQ.save(); CQ.refresh();
  };
  F['jar-add'] = function (form, fd) {
    CQ.saveToJar(CQ.goal(form.dataset.id), parseFloat(fd.get('amount')));
  };
  F['jar-out'] = function (form, fd) {
    const c = kid(), g = CQ.goal(form.dataset.id), amount = parseFloat(fd.get('amount')), saved = CQ.goalSaved(g);
    if (!(amount > 0) || amount > saved) return CQ.toast('You can take out up to ' + money(saved), 'warn');
    CQ.ask('Take ' + money(amount) + ' out of your ' + g.name + ' jar?', 'Yes, take it out', () => {
      CQ.addTx({ childId: c.id, type: 'withdraw', amount, goalId: g.id, goalName: g.name });
      CQ.save(); CQ.toast('Moved back to your wallet'); CQ.refresh();
    }, { emoji: '🫙' });
  };
  F['goal-date'] = function (form, fd) {
    const g = CQ.goal(form.dataset.id);
    g.targetDate = fd.get('targetDate') || null;
    CQ.save(); CQ.toast('Plan updated 📅'); CQ.refresh();
  };
  F['goal-bought'] = function (form, fd) {
    const c = kid(), g = CQ.goal(form.dataset.id), saved = CQ.goalSaved(g);
    CQ.addTx({ childId: c.id, type: 'withdraw', amount: saved, goalId: g.id, goalName: g.name });
    CQ.addTx({ childId: c.id, type: 'out', amount: g.price, category: fd.get('category') || 'other', note: g.name + ' (savings goal)' });
    g.status = 'done'; g.doneAt = new Date().toISOString();
    S().goals.filter((x) => x.childId === c.id && x.status === 'active').sort((a, b) => a.priority - b.priority).forEach((x, k) => { x.priority = k; });
    CQ.celebrate({ emoji: '🛍️', title: 'Enjoy your ' + g.name + '!', text: 'You saved up and bought it yourself. That is a real money skill!', sound: 'win' });
    CQ.addXP(c, 30, 'goal complete');
    CQ.save(); CQ.go('save');
  };
  A['goal-delete'] = function (el) {
    const c = kid(), g = CQ.goal(el.dataset.id), saved = CQ.goalSaved(g);
    CQ.ask('Delete "' + g.name + '"?' + (saved > 0 ? ' The ' + money(saved) + ' inside goes back to your wallet.' : ''), 'Yes, delete goal', () => {
      if (saved > 0) CQ.addTx({ childId: c.id, type: 'withdraw', amount: saved, goalId: g.id, goalName: g.name });
      S().goals = S().goals.filter((x) => x.id !== g.id);
      CQ.goalsFor(c.id).forEach((x, k) => { x.priority = k; });
      CQ.save(); CQ.toast('Goal deleted'); CQ.go('save');
    }, { emoji: '🗑️', danger: true });
  };

  /* Teen extra: bank savings & interest */
  function bankCalc(amt, rate, years) {
    const vals = [];
    for (let y = 0; y <= years; y++) vals.push(amt * Math.pow(1 + rate / 100, y));
    const end = vals[vals.length - 1], max = end || 1;
    return '<div class="growth" aria-hidden="true">' + vals.map((v, y) => '<div style="height:' + Math.max(3, (v / max) * 100) + '%"><span>' + (y === 0 ? 'Now' : 'Y' + y) + '</span></div>').join('') + '</div>' +
      '<p style="margin-top:28px">Put in <b>' + money(amt) + '</b> at <b>' + rate + '%</b> a year. After <b>' + CQ.plural(years, 'year') + '</b> you\'d have <b>' + money(Math.round(end)) + '</b>.</p>' +
      '<p class="info good">That\'s <b>' + money(Math.round(end - amt)) + '</b> of interest — money you didn\'t have to work for. 🌱</p>' +
      '<p class="muted tiny">Rule of 72: at ' + rate + '%, your money doubles in about ' + Math.round(72 / rate) + ' years. Real rates change; this is a simple yearly example.</p>';
  }
  R['save/bank'] = function () {
    const k = CQ.currency().scale, step = Math.max(1, Math.round(500 * k)), amt = Math.round(10000 * k), max = Math.round(100000 * k);
    const body = '<section class="card"><h2>🏦 What is a savings account?</h2>' +
      '<p>It\'s a safe place at a bank to keep money you\'re not spending yet. Unlike a jar at home, the bank <b>pays you</b> for keeping it there. That payment is called <b>interest</b>.</p>' +
      '<p><b>Interest</b> is a percentage of your balance. At 4% a year, ' + CQ.fill('{10000}') + ' earns about ' + CQ.fill('{400}') + '.</p>' +
      '<p><b>Compound interest</b> means next year you earn interest on the interest too — so it snowballs the longer you leave it.</p>' +
      '<p class="muted">In many countries, under-18s can open a savings account with a parent or guardian. Ask yours to compare interest rates, fees and minimum balances.</p></section>' +
      '<section class="card"><h3>🧮 Try it</h3><form class="form" data-input="bank" onsubmit="return false">' +
      '<label class="field"><span>Amount: <output name="o-amt">' + money(amt) + '</output></span><input type="range" name="amt" min="' + step + '" max="' + max + '" step="' + step + '" value="' + amt + '"></label>' +
      '<label class="field"><span>Interest rate: <output name="o-rate">4%</output> a year</span><input type="range" name="rate" min="1" max="10" step="0.5" value="4"></label>' +
      '<label class="field"><span>Years: <output name="o-years">5</output></span><input type="range" name="years" min="1" max="10" step="1" value="5"></label>' +
      '</form><div id="bank-out">' + bankCalc(amt, 4, 5) + '</div></section>' +
      CQ.tipCard('bank') + '<a class="btn btn-ghost btn-block" href="#/learn">📚 Take the "Make your money grow" lesson</a>';
    return CQ.shell(body, { back: 'save', tab: 'save', title: '🏦 Banks & interest', world: 'w2' });
  };
  I.bank = function (form) {
    const amt = Number(form.amt.value), rate = Number(form.rate.value), years = Number(form.years.value);
    form['o-amt'].value = money(amt); form['o-rate'].value = rate + '%'; form['o-years'].value = years;
    document.getElementById('bank-out').innerHTML = bankCalc(amt, rate, years);
  };

  /* =========================== WORLD 3 — ASK FIRST =========================== */
  function reqRow(r) {
    return '<a class="req-card" href="#/ask/req?id=' + r.id + '">' + reqPic(r) + '<div class="req-main"><strong>' + esc(r.item) + '</strong><span class="muted tiny">' +
      money(r.price) + ' · ' + CQ.fmtDate(r.createdAt) + (r.status === 'cooling' && !isReady(r) ? ' · ' + CQ.timeLeft(r.waitUntil) + ' left' : '') + '</span></div>' + statusPill(r) + '</a>';
  }
  R.ask = function (p) {
    const c = kid();
    const reqs = S().requests.filter((r) => r.childId === c.id).sort((a, b) => CQ.time(b.createdAt) - CQ.time(a.createdAt));
    const active = reqs.filter((r) => r.status === 'cooling');
    let hist = reqs.filter((r) => r.status === 'bought' || r.status === 'skipped');
    const f = p.f || 'all';
    if (f === 'good') hist = hist.filter((r) => r.reflection === 'good');
    if (f === 'regret') hist = hist.filter((r) => r.reflection === 'regret');
    let body = CQ.mascot('🐢', CQ.t('The rich think before they spend! 🧐 Let\'s check before you buy, then ask your parents.', 'Pause. Think. Ask your parents. Your future self will thank you.')) +
      '<a class="btn btn-coral btn-block btn-big" href="#/ask/new">🤔 I want to buy something</a>';
    body += '<section class="card"><h3>⏳ Waiting 48 hours</h3>' + (active.length ? '<div class="req-list">' + active.map(reqRow).join('') + '</div>' : '<p class="muted">Nothing on a wait right now.</p>') + '</section>';
    body += '<section class="card"><div class="card-head"><h3>📖 Looking back</h3><div class="seg">' +
      [['all', 'All'], ['good', '👍 Good buys'], ['regret', '😕 Regrets']].map(([k, l]) => '<a href="#/ask?f=' + k + '"' + (f === k ? ' class="active"' : '') + '>' + l + '</a>').join('') + '</div></div>' +
      (hist.length ? '<div class="req-list">' + hist.map(reqRow).join('') + '</div>' : '<p class="muted">Nothing here yet. After you buy something, come back and say if it was a good buy.</p>') + '</section>' +
      CQ.tipCard('ask');
    return CQ.shell(body, { tab: 'ask', title: '🛍️ ' + askTitle(), world: 'w3' });
  };

  R['ask/new'] = function () {
    const d = CQ.reqDraft || {};
    const body = CQ.guide('🐢', 'What do you want, and why? Then we\'ll do a quick Think First check.') +
      '<form class="card form" data-form="req-1">' +
      '<label class="field"><span>What do you want to buy?</span><input name="item" required maxlength="50" autofocus value="' + esc(d.item || '') + '" placeholder="' + CQ.t('e.g. Pokémon cards', 'e.g. Sneakers') + '"></label>' +
      CQ.amountField('price', 'How much does it cost?', d.price) +
      '<fieldset><legend>What kind of thing?</legend><div class="chips">' + CQ.CATEGORIES.map((k, i) => CQ.chip('category', k.id, k.emoji + ' ' + k.name, d.category ? d.category === k.id : i === 2)).join('') + '</div></fieldset>' +
      '<label class="field"><span>Why do you want it?</span><textarea name="reason" required maxlength="200" placeholder="' + CQ.t('Because…', 'Make your case…') + '">' + esc(d.reason || '') + '</textarea></label>' +
      '<button class="btn btn-coral btn-block btn-big">Next: Think First 🧠</button></form>';
    return CQ.shell(body, { back: 'ask', tab: 'ask', title: '🛍️ Can I buy this?', world: 'w3' });
  };
  F['req-1'] = function (form, fd) {
    const price = parseFloat(fd.get('price'));
    if (!(price > 0)) return CQ.toast('Add the price', 'warn');
    CQ.reqDraft = { item: fd.get('item').trim(), price: CQ.round2(price), category: fd.get('category'), reason: fd.get('reason').trim() };
    CQ.go('ask/think');
  };

  R['ask/think'] = function () {
    const d = CQ.reqDraft;
    if (!d) { setTimeout(() => CQ.go('ask/new')); return null; }
    const c = kid(), bal = CQ.balance(c.id), enough = bal >= d.price;
    const top = CQ.goalsFor(c.id)[0], plan = top && CQ.goalPlan(top);
    const weeks = plan && plan.perWeek > 0 ? Math.ceil(d.price / plan.perWeek) : null;
    d.check = { enough, impactWeeks: weeks, impactGoal: top ? top.name : null };
    let impact;
    if (!top) impact = '<div class="info good">You don\'t have a savings goal right now, so nothing slows down.</div>';
    else if (weeks) impact = '<div class="info ' + (weeks >= 2 ? 'bad' : 'meh') + '">' + CQ.goalPic(top) + ' Your <b>' + esc(top.name) + '</b> goal moves back about <b>' + CQ.plural(weeks, 'week') + '</b>.</div>';
    else impact = '<div class="info meh">This is ' + Math.round((d.price / top.price) * 100) + '% of the price of your <b>' + esc(top.name) + '</b>.</div>';
    // One question at a time, like a game. Tapping an answer moves on automatically.
    const total = 5;
    const q = (n, title, inner, gotIt) => '<section class="card think-q" data-step="' + (n - 1) + '"><p class="tiny muted">Question ' + n + ' of ' + total + '</p><h3><span class="qnum">' + n + '</span>' + title + '</h3>' + inner +
      (gotIt ? '<button type="button" class="btn btn-primary btn-block" data-act="think-go" data-to="' + n + '">Got it →</button>' : '') + '</section>';
    const body = '<section class="card req-card" style="grid-template-columns:56px 1fr">' + reqPic(d) + '<div class="req-main"><strong>' + esc(d.item) + '</strong><span class="muted">' + money(d.price) + '</span></div></section>' +
      CQ.mascot('🐢', CQ.t('Five quick questions before you buy. Tap an answer!', 'Five quick checks. Be honest with yourself.')) +
      '<div class="think-dots" aria-hidden="true">' + Array.from({ length: total + 1 }, (_, i) => '<i data-dot="' + i + '"></i>').join('') + '</div>' +
      '<form class="form think-steps" data-form="req-think" data-change="think-nudge" novalidate data-cur="0">' +
      q(1, 'Is it a need or a want?', '<p class="muted tiny">' + CQ.t('Need = you must have it (like school shoes). Want = nice to have.', 'Need = essential. Want = makes life better but you could live without it.') + '</p>' +
        '<div class="choice-chips">' + CQ.chip('need', 'need', '🥦 Need', false) + CQ.chip('need', 'want', '🎈 Want', false) + '</div>') +
      q(2, 'Do I have enough money?', enough
        ? '<div class="info good">✅ Yes! You have ' + money(bal) + '. After buying you\'d have <b>' + money(CQ.round2(bal - d.price)) + '</b> left.</div>'
        : '<div class="info bad">❌ Not yet. You have ' + money(bal) + ' — you need <b>' + money(CQ.round2(d.price - bal)) + '</b> more.</div>', true) +
      q(3, 'Will this slow down my savings goal?', impact, true) +
      q(4, 'Can I find it cheaper or wait for a sale?', '<div class="choice-chips three">' + CQ.chip('cheaper', 'checked', '🔎 I checked — this is a good price', false) +
        CQ.chip('cheaper', 'maybe', '🤔 I could look around more', false) + CQ.chip('cheaper', 'sale', '🏷️ I could wait for a sale', false) + '</div>') +
      q(5, 'Will I still want it in a week?', '<div class="choice-chips">' + CQ.chip('stillWant', 'yes', '💖 Yes, for sure', false) + CQ.chip('stillWant', 'notsure', '🤷 Not sure', false) + '</div>') +
      '<section class="card think-q" data-step="5"><div class="center"><div class="big-emoji">🧠</div><h3>All done thinking!</h3><p class="muted">What would you like to do?</p></div>' +
      '<div class="nudge" id="nudge"></div>' +
      '<div class="stack">' + (enough ? '<button type="button" class="btn btn-green btn-big btn-block" data-act="think-buy">🛍️ Buy it now <span class="tiny">(ask your parents)</span></button>' : '') +
      '<button class="btn btn-primary btn-block" name="go" value="wait">⏳ Wait 48 hours first</button>' +
      '<button class="btn btn-ghost btn-block" name="go" value="skip">🙅 Never mind, I\'ll skip it</button></div></section>' +
      '<button type="button" class="link-btn think-back" data-act="think-back">← Previous question</button></form>';
    CQ.afterRender = () => CQ.thinkGo(0);
    return CQ.shell(body, { back: 'ask/new', tab: 'ask', title: '🧠 Think First', world: 'w3' });
  };
  CQ.thinkGo = function (i) {
    const form = document.querySelector('form[data-form="req-think"]');
    if (!form) return;
    const steps = form.querySelectorAll('[data-step]');
    i = Math.max(0, Math.min(steps.length - 1, i));
    form.dataset.cur = i;
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    document.querySelectorAll('.think-dots i').forEach((d, k) => { d.className = k < i ? 'done' : k === i ? 'on' : ''; });
    form.querySelector('.think-back').hidden = i === 0;
    if (i === steps.length - 1) thinkNudge(form);
  };
  A['think-go'] = (el) => CQ.thinkGo(Number(el.dataset.to));
  A['think-back'] = () => { const f = document.querySelector('form[data-form="req-think"]'); CQ.thinkGo(Number(f.dataset.cur) - 1); };
  function thinkNudge(form) {
    const need = form.querySelector('input[name=need]:checked'), sw = form.querySelector('input[name=stillWant]:checked'), ch = form.querySelector('input[name=cheaper]:checked');
    let msg = '';
    if (need && need.value === 'want' && sw && sw.value === 'notsure') msg = '🎩 Hmm, a want you\'re not sure about? Waiting 48 hours is a smart move.';
    else if (CQ.reqDraft && CQ.reqDraft.check && !CQ.reqDraft.check.enough) msg = '💡 You don\'t have enough money yet. Wait and save up first!';
    else if (ch && ch.value === 'sale') msg = '🏷️ Waiting for a sale could save you money.';
    else if (need && need.value === 'need' && sw && sw.value === 'yes') msg = '🌟 Well thought out! Now ask your parents before you buy.';
    document.getElementById('nudge').textContent = msg;
  }

  /* Buying always needs two checks: 1) a parent says OK, 2) "Are you sure?". */
  CQ.buyCheck = function (o) { CQ.buyOpts = o; buyStep1(); };
  function buyStep1() {
    const o = CQ.buyOpts;
    CQ.openModal('<div class="buycheck center"><span class="pill sun">Check 1 of 2</span><div class="big-emoji">👪</div>' +
      '<h2>Ask your parents first!</h2><p>Show this screen to your mom, dad or guardian.</p>' +
      '<div class="buy-summary">' + o.emoji + ' <b>' + esc(o.item) + '</b><span>' + money(o.price) + '</span></div>' +
      '<p class="muted">Did your parent say yes?</p><div class="stack">' +
      '<button class="btn btn-green btn-big btn-block" data-act="buy-ok1" autofocus>✅ Yes, my parent said OK</button>' +
      '<button class="btn btn-ghost btn-block" data-act="buy-cancel">Not yet</button></div></div>');
  }
  A['buy-ok1'] = function () {
    const o = CQ.buyOpts, bal = CQ.balance(kid().id);
    CQ.sfx('pop');
    CQ.openModal('<div class="buycheck center"><span class="pill green">Check 2 of 2</span>' + CQ.goldsworth('big') +
      '<h2>Are you sure?</h2><p>Buy <b>' + esc(o.item) + '</b> for <b>' + money(o.price) + '</b>?</p>' +
      '<div class="buy-summary"><span>Wallet now <b>' + money(bal) + '</b></span><span>→</span><span>After <b>' + money(CQ.round2(bal - o.price)) + '</b></span></div>' +
      '<div class="stack"><button class="btn btn-green btn-big btn-block" data-act="buy-ok2" autofocus>🛍️ Yes, buy it!</button>' +
      '<button class="btn btn-ghost btn-block" data-act="buy-cancel">No, cancel</button></div></div>');
  };
  A['buy-ok2'] = function () {
    const o = CQ.buyOpts;
    CQ.buyOpts = null;
    CQ.closeModal();
    if (o && o.onDone) o.onDone();
  };
  A['buy-cancel'] = function () {
    CQ.buyOpts = null;
    CQ.closeModal();
    CQ.toast('No problem — you can wait or ask again later.');
  };
  A['think-buy'] = function () {
    const form = document.querySelector('form[data-form="req-think"]'), fd = new FormData(form), d = CQ.reqDraft;
    const missing = [['need', 0], ['cheaper', 3], ['stillWant', 4]].find(([n]) => !fd.get(n));
    if (missing) { CQ.toast('Answer this one first', 'warn'); return CQ.thinkGo(missing[1]); }
    CQ.buyCheck({ item: d.item, price: d.price, emoji: CQ.cat(d.category).emoji, onDone: () => finishThink(form, new FormData(form), 'buy') });
  };
  C['think-nudge'] = function (form, e) {
    if (!e.target.matches('input[type=radio]')) return;
    const cur = Number(form.dataset.cur), step = e.target.closest('[data-step]');
    if (step && Number(step.dataset.step) === cur) setTimeout(() => CQ.thinkGo(cur + 1), 380);
  };
  F['req-think'] = function (form, fd, submitter) { finishThink(form, fd, submitter ? submitter.value : 'wait'); };
  function finishThink(form, fd, go) {
    const c = kid(), d = CQ.reqDraft;
    if (!d) return CQ.go('ask/new');
    if (go !== 'skip') {
      const missing = [['need', 0], ['cheaper', 3], ['stillWant', 4]].find(([n]) => !fd.get(n));
      if (missing) { CQ.toast('Answer this one first', 'warn'); return CQ.thinkGo(missing[1]); }
    }
    const r = { id: CQ.uid(), childId: c.id, item: d.item, price: d.price, category: d.category, reason: d.reason,
      checklist: { need: fd.get('need'), enough: d.check.enough, impactWeeks: d.check.impactWeeks, impactGoal: d.check.impactGoal, cheaper: fd.get('cheaper'), stillWant: fd.get('stillWant') },
      createdAt: new Date().toISOString(), seen: true };
    if (go !== 'skip') { CQ.giveBadge(c, 'thinker'); CQ.addXP(c, 15, 'thought it through'); }
    if (go === 'buy') { if (!buyNow(c, r)) return; }
    else if (go === 'wait') { r.status = 'cooling'; r.waitUntil = new Date(Date.now() + 48 * 3600000).toISOString(); CQ.addXP(c, 10, 'cooling off'); }
    else { r.status = 'skipped'; CQ.sfx('keep'); CQ.giveBadge(c, 'smart_skip'); CQ.addXP(c, 20, 'smart skip'); }
    S().requests.push(r);
    CQ.reqDraft = null;
    CQ.save();
    CQ.go('ask/req?id=' + r.id);
  }

  const ANS = { need: { need: '🥦 Need', want: '🎈 Want' }, cheaper: { checked: '🔎 Checked the price', maybe: '🤔 Could look more', sale: '🏷️ Could wait for a sale' }, stillWant: { yes: '💖 Yes', notsure: '🤷 Not sure' } };
  CQ.answersList = function (r) {
    const k = r.checklist || {};
    return '<ul class="answers">' +
      '<li><span>Need or want?</span><b>' + (ANS.need[k.need] || '—') + '</b></li>' +
      '<li><span>Had enough money?</span><b>' + (k.enough ? '✅ Yes' : '❌ Not yet') + '</b></li>' +
      '<li><span>Effect on savings</span><b>' + (k.impactGoal && k.impactWeeks ? esc(k.impactGoal) + ' +' + CQ.plural(k.impactWeeks, 'week') : 'None') + '</b></li>' +
      '<li><span>Cheaper / sale?</span><b>' + (ANS.cheaper[k.cheaper] || '—') + '</b></li>' +
      '<li><span>Still want it in a week?</span><b>' + (ANS.stillWant[k.stillWant] || '—') + '</b></li>' +
      (r.parentOk ? '<li><span>Parents said OK?</span><b>👪 Yes</b></li>' : '') + '</ul>';
  };

  R['ask/req'] = function (p) {
    const c = kid(), r = CQ.request(p.id);
    if (!r || r.childId !== c.id) return CQ.shell(CQ.empty('🤷', 'Not found', '', '<a class="btn btn-coral" href="#/ask">Back</a>'), { back: 'ask', tab: 'ask', title: '🛍️ Can I buy this?', world: 'w3' });
    let action = '';
    if (r.status === 'cooling' && !isReady(r)) {
      action = '<div class="info meh center">⏳ Cooling off… <b>' + CQ.timeLeft(r.waitUntil) + '</b> left.<br><span class="tiny">Come back when the timer ends and see if you still want it.</span></div>' +
        '<button class="btn btn-ghost btn-block" data-act="req-skip" data-id="' + r.id + '">🙅 I don\'t want it anymore</button>';
    } else if (isReady(r)) {
      action = CQ.mascot('🐢', 'Your 48 hours are up! Do you <b>still</b> want ' + esc(r.item) + '?') +
        '<div class="row"><button class="btn btn-green" data-act="req-after-wait" data-id="' + r.id + '" data-v="buy">💖 Yes — ask my parents</button>' +
        '<button class="btn btn-ghost" data-act="req-after-wait" data-id="' + r.id + '" data-v="skip">🙅 No, skip it</button></div>';
    } else if (r.status === 'bought') {
      action = '<section class="stack"><h3>🤔 Looking back, was it a good buy?</h3><div class="choice-chips">' +
        '<button class="btn ' + (r.reflection === 'good' ? 'btn-green' : 'btn-ghost') + '" data-act="reflect" data-id="' + r.id + '" data-v="good">👍 Good buy</button>' +
        '<button class="btn ' + (r.reflection === 'regret' ? 'btn-coral' : 'btn-ghost') + '" data-act="reflect" data-id="' + r.id + '" data-v="regret">😕 I regret it</button></div>' +
        (r.reflection ? '<form class="form-row" data-form="reflect-note" data-id="' + r.id + '"><label class="field"><span class="sr-only">Why?</span><input name="note" maxlength="120" value="' + esc(r.reflectionNote || '') + '" placeholder="Why? (optional)"></label><button class="btn btn-ghost">Save</button></form>' : '') +
        '</section>';
    } else if (r.status === 'skipped') {
      action = '<div class="info good center">🙅 You decided to skip this one. That money stays yours!</div>';
    }
    const body = '<section class="card req-hero">' + reqPic(r) + '<h2>' + esc(r.item) + '</h2><p class="big-number">' + money(r.price) + '</p>' + statusPill(r) +
      '<p class="muted" style="margin-top:10px">“' + esc(r.reason) + '”</p><p class="tiny muted">Added ' + CQ.dayLabel(r.createdAt) + '</p></section>' +
      '<section class="card stack">' + action + '</section>' +
      '<section class="card"><h3>🧠 My Think First answers</h3>' + CQ.answersList(r) + '</section>';
    return CQ.shell(body, { back: 'ask', tab: 'ask', title: '🛍️ Can I buy this?', world: 'w3' });
  };
  // Logs the purchase (only called after both checks). Returns false if there isn't enough money.
  function buyNow(c, r) {
    const bal = CQ.balance(c.id);
    if (r.price > bal + 1e-9) { CQ.notEnough(bal, r.price); return false; }
    const t = CQ.addTx({ childId: c.id, type: 'out', amount: r.price, category: r.category, note: r.item, requestId: r.id });
    r.status = 'bought'; r.txId = t.id; r.boughtAt = t.date; r.parentOk = true;
    CQ.sfx('spend');
    CQ.addXP(c, 5, 'buy logged');
    CQ.checkBadges(c);
    return true;
  }
  A['req-skip'] = function (el) {
    const c = kid(), r = CQ.request(el.dataset.id);
    const wasCooling = r.status === 'cooling';
    r.status = 'skipped';
    CQ.sfx('keep');
    CQ.giveBadge(c, 'smart_skip');
    if (wasCooling) CQ.giveBadge(c, 'patient');
    CQ.addXP(c, 20, 'smart skip');
    CQ.save(); CQ.refresh();
  };
  A['req-after-wait'] = function (el) {
    const c = kid(), r = CQ.request(el.dataset.id);
    if (el.dataset.v === 'buy') {
      if (r.price > CQ.balance(c.id) + 1e-9) { buyNow(c, r); return; } // shows "you need X more"
      CQ.buyCheck({ item: r.item, price: r.price, emoji: CQ.cat(r.category).emoji, onDone: () => {
        if (!buyNow(c, r)) return;
        CQ.giveBadge(c, 'patient'); CQ.addXP(c, 10, 'waited first');
        CQ.save(); CQ.refresh();
      } });
      return;
    }
    r.status = 'skipped'; CQ.sfx('keep'); CQ.giveBadge(c, 'patient'); CQ.giveBadge(c, 'smart_skip'); CQ.addXP(c, 20, 'smart skip');
    CQ.save(); CQ.refresh();
  };
  A.reflect = function (el) {
    const c = kid(), r = CQ.request(el.dataset.id), first = !r.reflection;
    r.reflection = el.dataset.v;
    if (first) CQ.addXP(c, 5, 'looked back');
    CQ.save(); CQ.refresh();
  };
  F['reflect-note'] = function (form, fd) {
    CQ.request(form.dataset.id).reflectionNote = (fd.get('note') || '').trim();
    CQ.save(); CQ.toast('Saved');
  };

  /* =========================== LESSONS =========================== */
  R.learn = function () {
    const c = kid();
    const guideDone = (c.guide || []).length;
    let body = CQ.mascot('🦉', CQ.t('Mini lessons take 2 minutes. Finish the quiz to earn XP! ⭐', '2-minute lessons with a 3-question quiz. XP for every right answer.')) +
      '<a class="card guide-card" href="#/learn/guide"><span class="guide-emoji">📘</span><span><b>The Money Guide</b><br><span class="muted">How to save and invest, step by step — with a growth calculator</span>' +
      CQ.progress(Math.round((guideDone / GUIDE.length) * 100), 'green') + '<span class="tiny muted">' + guideDone + ' of ' + GUIDE.length + ' steps done</span></span></a>' +
      vaultLink();
    ['spend', 'save', 'ask', 'invest'].forEach((w) => {
      const wd = W[w];
      body += '<h2 class="section-title">' + wd.mascot + ' ' + wd.label + ': ' + wd.title + '</h2><div class="lesson-list">' +
        CQ.LESSONS.filter((l) => l.world === w).map((l) => {
          const best = c.lessons && c.lessons[l.id];
          return '<button class="lesson-item ' + wd.cls + '" data-act="lesson-start" data-id="' + l.id + '"><span class="l-emoji">' + l.emoji + '</span><span><b>' + l.title + '</b><br><span class="tiny muted">2 min · 3 questions</span></span>' +
            (best == null ? '<span class="pill sun">New</span>' : '<span class="pill green">' + '⭐'.repeat(best) + (best < 3 ? '☆'.repeat(3 - best) : '') + '</span>') + '</button>';
        }).join('') + '</div>';
    });
    return CQ.shell(body, { tab: 'learn', title: '📚 Learn' });
  };

  /* =========================== MONEY GUIDE: SAVE & INVEST =========================== */
  // Each step: [emoji, title, kids text, teens text, optional link [href, label]]. Text can hold HTML lists.
  const GUIDE = [
    ['💰', 'Earn it', 'Pocket money, birthday money, helping with chores — every coin counts!', 'Pocket money, gifts, chores, tutoring or a part-time job. Know how much comes in each month.', ['spend/in', 'Add money in']],
    ['🔍', 'Track it', 'Write down everything you buy. You can\'t plan money you can\'t see!', 'Log every spend. Small, frequent buys are where money leaks out.', ['spend', 'See my spending']],
    ['🥧', 'Plan it', 'Split your money into 3 jars: <b>Spend</b> for now, <b>Save</b> for later, <b>Share</b> to help others.', 'Use the <b>50/30/20 rule</b>: 50% for needs, 30% for wants, 20% for saving and investing.', null],
    ['🫙', 'Save first', 'Pay yourself first! Pick a goal and put money in the jar as soon as you get it.', 'Pay yourself first: move savings out the day money arrives. Give every goal a price and a date.', ['save/new', 'Make a goal']],
    ['☔', 'Keep rainy-day money', 'Keep a little money for surprises, like a lost water bottle. Keep it apart from your goal jar.', 'Build a small emergency fund (even {1000}–{2000}) for surprises, separate from your goals.', null],
    ['🧠', 'Think before you buy', 'Do the Think First check, wait 48 hours for big wants, and always ask your parents.', 'Do the Think First check, use the 48-hour rule for wants, and always ask your parents first.', ['ask/new', 'Try Think First']],
    ['🏦', 'Use a bank', 'A bank keeps your money safe and even pays you a little extra (interest). A grown-up can help you open an account.', 'A savings account keeps money safe and pays interest. A parent or guardian can help you open one and compare rates.', null],
    ['📈', 'Invest for the long run', 'Investing is for money you won\'t need for many years:<ul><li>Spread it out — don\'t put all your eggs in one basket.</li><li>Be patient. Prices go up and down.</li><li>Always invest together with a parent or guardian.</li></ul>',
      'When you have savings and a rainy-day fund:<ul><li>Only invest money you won\'t need for <b>5+ years</b>.</li><li><b>Diversify</b> — low-cost index funds hold hundreds of companies.</li><li>Keep <b>fees</b> low; they quietly eat your growth.</li><li>Invest a little <b>regularly</b> and don\'t panic when prices drop.</li><li>Under 18? A <b>parent or guardian</b> opens and manages the account with you.</li></ul>', null],
    ['🚩', 'Avoid money traps', 'Watch out for anyone who promises easy money, and never share passwords or codes.', 'Red flags: “guaranteed” or get-rich-quick returns, borrowing to buy wants, hype from strangers online, and anyone asking for passwords, OTPs or card details.', null],
    ['🎁', 'Give a little', 'Sharing some money to help people or causes you care about makes the world better.', 'Giving to people or causes you care about is a powerful use of money too. Plan it into your budget.', null],
  ];

  function investCalc(monthly, years, rate) {
    const r = rate / 100 / 12, fv = (m) => (r === 0 ? monthly * m : monthly * (Math.pow(1 + r, m) - 1) / r);
    const total = fv(years * 12), putIn = monthly * years * 12, earlier = fv((years + 5) * 12);
    const points = Math.min(years, 10), bars = [];
    for (let i = 1; i <= points; i++) { const y = Math.round((years * i) / points); bars.push({ y, v: fv(y * 12), p: monthly * y * 12 }); }
    const max = total || 1;
    return '<div class="growth stacked" aria-hidden="true">' + bars.map((b) =>
      '<div style="height:' + Math.max(3, (b.v / max) * 100) + '%"><i style="height:' + ((b.p / b.v) * 100) + '%"></i><span>' + b.y + 'y</span></div>').join('') + '</div>' +
      '<div class="legend-row"><span><i class="sw-in"></i> Money you put in</span><span><i class="sw-grow"></i> Growth</span></div>' +
      '<p>Invest <b>' + money(monthly) + '</b> a month for <b>' + CQ.plural(years, 'year') + '</b>. You put in <b>' + money(Math.round(putIn)) + '</b>, and it could grow to about <b>' + money(Math.round(total)) + '</b>.</p>' +
      '<p class="info good">That\'s about <b>' + money(Math.round(total - putIn)) + '</b> of growth. 🌱 Start 5 years earlier and it could be about <b>' + money(Math.round(earlier)) + '</b>!</p>' +
      '<p class="muted tiny">Just an example. Real investments go up and down, and returns are never guaranteed.</p>';
  }

  R['learn/guide'] = function () {
    const c = kid(), done = c.guide || [];
    const k = CQ.currency().scale, step = Math.max(1, Math.round(100 * k)), m0 = Math.max(step, Math.round(500 * k)), mMax = Math.round(10000 * k);
    let body = '<section class="card center" id="guide-top"><div class="big-emoji">📘</div><h2>The Money Guide</h2><p class="muted">How to save and invest, step by step. Tick each step when you\'ve got it!</p>' +
      CQ.progress(Math.round((done.length / GUIDE.length) * 100), 'green') + '<p class="tiny muted" id="guide-count">' + done.length + ' of ' + GUIDE.length + ' steps done</p></section>' +
      CQ.mascot('🎩', CQ.t('Follow these steps, my friend, and you\'ll be a money tycoon! 🎩', 'The same steps rich people follow. Start now and time is on your side.'));
    body += '<div class="guide-steps">' + GUIDE.map(([e, title, kidT, teenT, link], i) =>
      '<details class="card guide-step' + (done.indexOf(i) !== -1 ? ' done' : '') + '"' + (i === 0 ? ' open' : '') + '><summary><span class="g-num">' + (i + 1) + '</span><span class="g-emoji">' + e + '</span><b>' + title + '</b></summary>' +
      '<div class="g-body">' + CQ.fill(CQ.t(kidT, teenT)) +
      (link ? '<p><a class="btn btn-ghost btn-small" href="#/' + link[0] + '">' + link[1] + ' →</a></p>' : '') +
      '<label class="check"><input type="checkbox" data-change="guide-check" data-i="' + i + '"' + (done.indexOf(i) !== -1 ? ' checked' : '') + '><span>Got it! ✓</span></label></div></details>').join('') + '</div>';
    body += '<section class="card"><h3>📈 Grow it! Investing calculator</h3><form class="form" data-input="invest-calc" onsubmit="return false">' +
      '<label class="field"><span>Invest each month: <output name="o-m">' + money(m0) + '</output></span><input type="range" name="m" min="' + step + '" max="' + mMax + '" step="' + step + '" value="' + m0 + '"></label>' +
      '<label class="field"><span>For: <output name="o-y">10 years</output></span><input type="range" name="y" min="1" max="40" step="1" value="10"></label>' +
      '<label class="field"><span>Yearly growth (example): <output name="o-r">8%</output></span><input type="range" name="r" min="0" max="12" step="0.5" value="8"></label>' +
      '</form><div id="invest-out">' + investCalc(m0, 10, 8) + '</div></section>';
    body += CQ.tipCard('safety') + '<section class="card"><h3>📚 Learn more</h3><p class="muted">Take the investing lessons to earn the <b>📈 Future Investor</b> badge.</p><a class="btn btn-purple btn-block" href="#/learn">Go to the lessons</a></section>' +
      '<p class="tiny muted center">MyMoney teaches money basics. It isn\'t financial advice. Always talk to a parent or guardian before saving or investing real money.</p>';
    return CQ.shell(body, { back: 'learn', tab: 'learn', title: '📘 Money Guide' });
  };
  I['invest-calc'] = function (form) {
    const m = Number(form.m.value), y = Number(form.y.value), r = Number(form.r.value);
    form['o-m'].value = money(m); form['o-y'].value = CQ.plural(y, 'year'); form['o-r'].value = r + '%';
    document.getElementById('invest-out').innerHTML = investCalc(m, y, r);
  };
  C['guide-check'] = function (el) {
    const c = kid(), i = Number(el.dataset.i);
    c.guide = (c.guide || []).filter((x) => x !== i);
    if (el.checked) { c.guide.push(i); CQ.sfx('pop'); }
    el.closest('.guide-step').classList.toggle('done', el.checked);
    if (el.checked) { el.closest('details').open = false; const next = el.closest('.guide-step').nextElementSibling; if (next) next.open = true; }
    document.getElementById('guide-count').textContent = c.guide.length + ' of ' + GUIDE.length + ' steps done';
    const bar = document.querySelector('#guide-top .progress > div');
    if (bar) bar.style.width = Math.round((c.guide.length / GUIDE.length) * 100) + '%';
    if (c.guide.length === GUIDE.length && !c.guideXP) {
      c.guideXP = true;
      CQ.celebrate({ emoji: '📘', title: 'Money Guide complete!', text: 'You know the steps to save and invest like a pro. Splendid!', sound: 'win' });
      CQ.addXP(c, 30, 'guide complete');
    }
    CQ.save();
  };
  A['lesson-start'] = function (el) {
    CQ.lessonRun = { id: el.dataset.id, step: 0, score: 0, answered: null };
    CQ.go('learn/lesson?id=' + el.dataset.id);
  };
  R['learn/lesson'] = function (p) {
    const c = kid(), L = CQ.LESSONS.find((l) => l.id === p.id);
    if (!L) return CQ.shell(CQ.empty('🤷', 'Lesson not found', ''), { back: 'learn', tab: 'learn', title: 'Lesson' });
    if (!CQ.lessonRun || CQ.lessonRun.id !== L.id) CQ.lessonRun = { id: L.id, step: 0, score: 0, answered: null };
    const run = CQ.lessonRun, slides = L.slides[c.mode] || L.slides.kid, total = slides.length + L.quiz.length;
    const dots = '<div class="dots">' + Array.from({ length: total }, (_, i) => '<i' + (i <= run.step ? ' class="on"' : '') + '></i>').join('') + '</div>';
    let body;
    if (run.step < slides.length) {
      const sl = slides[run.step];
      body = dots + '<section class="card slide"><div class="big-emoji">' + sl.e + '</div><p>' + CQ.fill(sl.t) + '</p></section>' +
        '<button class="btn btn-primary btn-big btn-block" data-act="lesson-next" autofocus>' + (run.step === slides.length - 1 ? 'Start the quiz 🧩' : 'Next →') + '</button>';
    } else if (run.step < total) {
      const qi = run.step - slides.length, q = L.quiz[qi], ans = run.answered;
      body = dots + '<section class="card"><p class="muted tiny">Question ' + (qi + 1) + ' of ' + L.quiz.length + '</p><h2>' + CQ.fill(q.q) + '</h2><div class="options">' +
        q.o.map((o, i) => {
          let cls = '';
          if (ans != null) { if (i === q.a) cls = ' right'; else if (i === ans) cls = ' wrong'; }
          return '<button class="opt' + cls + '" data-act="lesson-answer" data-i="' + i + '"' + (ans != null ? ' disabled' : '') + '>' + CQ.fill(o) + '</button>';
        }).join('') + '</div>' +
        (ans != null ? '<p class="info ' + (ans === q.a ? 'good' : 'meh') + '" style="margin-top:12px">' + (ans === q.a ? '🎉 Correct! ' : '💡 ') + CQ.fill(q.x) + '</p>' : '') + '</section>' +
        (ans != null ? '<button class="btn btn-primary btn-big btn-block" data-act="lesson-next" autofocus>' + (run.step === total - 1 ? 'See my score' : 'Next question →') + '</button>' : '');
    } else {
      body = '<section class="card center"><div class="big-emoji">' + (run.score === 3 ? '🏆' : run.score === 2 ? '🎉' : '💪') + '</div><h2>' + run.score + ' out of 3!</h2>' +
        '<div class="stars">' + '⭐'.repeat(run.score) + '☆'.repeat(3 - run.score) + '</div><p>' + (run.score === 3 ? 'Perfect! You really get it.' : 'Nice work! Try again for 3 stars.') + '</p></section>' +
        '<div class="row"><button class="btn btn-ghost" data-act="lesson-start" data-id="' + L.id + '">↻ Try again</button><a class="btn btn-primary" href="#/learn">More lessons</a></div>';
    }
    return CQ.shell(body, { back: 'learn', tab: 'learn', title: L.emoji + ' ' + L.title });
  };
  A['lesson-answer'] = function (el) {
    const run = CQ.lessonRun, L = CQ.LESSONS.find((l) => l.id === run.id);
    if (run.answered != null) return;
    const slides = L.slides[kid().mode] || L.slides.kid, q = L.quiz[run.step - slides.length];
    run.answered = Number(el.dataset.i);
    if (run.answered === q.a) { run.score++; CQ.sfx('correct'); } else { CQ.sfx('wrong'); CQ.buzz([30, 40, 30]); }
    CQ.refresh();
  };
  A['lesson-next'] = function () {
    const c = kid(), run = CQ.lessonRun, L = CQ.LESSONS.find((l) => l.id === run.id);
    const slides = L.slides[c.mode] || L.slides.kid, total = slides.length + L.quiz.length;
    run.step++; run.answered = null;
    const finished = run.step === total, perfect = finished && run.score === 3;
    let badgePopup = false;
    if (finished) {
      c.lessons = c.lessons || {};
      const prev = c.lessons[L.id];
      if (prev == null) CQ.addXP(c, run.score * 10 + (run.score === 3 ? 20 : 0) + 10, 'lesson done');
      else if (run.score > prev) CQ.addXP(c, (run.score - prev) * 10, 'new best');
      c.lessons[L.id] = Math.max(prev || 0, run.score);
      if (perfect) badgePopup = CQ.giveBadge(c, 'quiz_whiz');
      CQ.checkBadges(c);
      CQ.save();
    }
    CQ.refresh();
    // 3 stars = make it rain money! (The first time, the badge pop-up already rains money.)
    if (perfect) { CQ.sfx('kaching'); if (!badgePopup) { CQ.confetti(); CQ.buzz([40, 60, 40]); } }
  };

  /* =========================== REWARDS & PROFILES =========================== */
  R.rewards = function () {
    const c = kid(), lvl = CQ.levelOf(c.xp), into = c.xp % CQ.XP_PER_LEVEL, streak = CQ.saveStreak(c.id);
    const body = '<section class="card hero"><div class="hero-top"><div class="hero-avatar">' + CQ.avatar(c.avatar) + '</div><div><p class="hero-hi">' + esc(c.name) + '</p><h2 class="hero-level">Level ' + lvl + ' ' + CQ.rankChip(lvl) + '</h2></div></div>' +
      CQ.progress(Math.round((into / CQ.XP_PER_LEVEL) * 100), 'xp') + '<p class="tiny muted">' + c.xp + ' XP total · ' +
      (lvl < CQ.LEVELS.length ? 'next rank: ' + CQ.levelTier(lvl + 1).emoji + ' ' + CQ.levelName(lvl + 1) : 'top rank reached! 💎') + '</p></section>' +
      '<section class="card"><h3>⛏️ Ranks</h3><div class="rank-ladder">' + CQ.LEVELS.map((t, i) =>
        '<div class="rank-step' + (i + 1 <= lvl ? ' got' : '') + (i + 1 === Math.min(lvl, CQ.LEVELS.length) ? ' now' : '') + '">' + CQ.rankChip(i + 1) +
        '<small>' + (i * CQ.XP_PER_LEVEL) + ' XP</small></div>').join('') + '</div></section>' +
      '<section class="card"><h3>🔥 Saving streak: ' + CQ.plural(streak, 'week') + '</h3><p class="muted">Put something in a goal jar every week to keep your streak going.</p></section>' +
      '<section class="card"><h3>🏅 Badges (' + c.badges.length + '/' + CQ.BADGES.length + ')</h3><div class="badge-grid">' +
      CQ.BADGES.map((b) => { const got = CQ.hasBadge(c, b.id); return '<div class="badge' + (got ? '' : ' locked') + '"><span class="b-emoji">' + (got ? b.emoji : '🔒') + '</span><strong>' + b.name + '</strong><small>' + b.desc + '</small></div>'; }).join('') +
      '</div></section>' +
      '<section class="card"><h3>⚡ How to earn XP</h3><ul class="xp-list">' +
      [['Add money or log a buy', 5], ['Put money in a goal jar', 10], ['Make a new goal', 15], ['Finish Think First', 15], ['Skip a buy you don\'t need', 20], ['Each right lesson answer', 10], ['Reach a goal milestone', 15], ['Read a new money tip', 2]]
        .map(([t, x]) => '<li><span>' + t + '</span><span class="pill purple">+' + x + ' XP</span></li>').join('') + '</ul></section>' + CQ.tipCard('home');
    return CQ.shell(body, { tab: 'home', back: 'home', title: '🏅 My rewards' });
  };

  R.profiles = function () {
    const s = S();
    const body = '<h2 class="center">Who\'s playing?</h2><div class="profile-grid">' + s.children.map((k) =>
      '<button class="profile' + (k.id === s.activeChildId ? ' active' : '') + '" data-act="switch-child" data-id="' + k.id + '"><span class="p-avatar">' + CQ.avatar(k.avatar) + '</span><strong>' + esc(k.name) + '</strong>' +
      '<span class="pill ' + (k.mode === 'teen' ? 'purple' : 'sun') + '">' + (k.mode === 'teen' ? 'Teen mode' : 'Kids mode') + '</span></button>').join('') + '</div>' +
      '<button class="btn btn-primary btn-block" data-act="add-player">＋ Add a player</button>';
    return CQ.shell(body, { back: 'home', title: 'Switch player', nav: false });
  };
  A['switch-child'] = function (el) {
    S().activeChildId = el.dataset.id;
    CQ.lessonRun = null; CQ.reqDraft = null;
    CQ.save();
    CQ.go('home');
  };
  A['add-player'] = function () { CQ.newOnboarding(true); CQ.go('welcome'); };

  /* =========================== SETTINGS (simple, no passwords) =========================== */
  R.settings = function () {
    const s = S(), c = kid();
    const body = '<section class="card stack"><div class="settings-who"><span class="hero-avatar">' + CQ.avatar(c.avatar) + '</span><h3 style="margin:0">' + esc(c.name) + '</h3></div>' +
      '<div class="settings-row"><span>Mode</span><span class="seg"><a href="#" data-act="set-mode" data-m="kid"' + (c.mode === 'kid' ? ' class="active"' : '') + '>🧸 Kids</a>' +
      '<a href="#" data-act="set-mode" data-m="teen"' + (c.mode === 'teen' ? ' class="active"' : '') + '>🎧 Teen</a></span></div>' +
      '<fieldset><legend>My look</legend><div class="chips avatar-chips" data-change="set-avatar">' + CQ.AVATARS.map((e, i) => CQ.chip('avatar', e, CQ.avatar(e) + '<span class="sr-only">Look ' + (i + 1) + '</span>', e === c.avatar)).join('') + '</div></fieldset></section>' +
      '<section class="card stack"><h3>⚙️ App</h3>' +
      '<button class="btn btn-ghost btn-block" data-act="toggle-sound" data-quiet="1">' + (CQ.soundOn() ? '🔊 Sounds & buzz: On' : '🔇 Sounds & buzz: Off') + '</button>' +
      (CQ.soundOn() ? '<div><p class="tiny muted" style="margin:0 0 6px">Tap to hear the sounds:</p><div class="sound-board">' +
        CQ.SOUND_BOARD.map(([s, l]) => '<button type="button" class="btn btn-ghost btn-small" data-act="play-sfx" data-s="' + s + '" data-quiet="1">' + l + '</button>').join('') + '</div></div>' : '') +
      '<label class="field"><span>Money type</span><select data-change="set-currency">' + CQ.CURRENCIES.map((k) => '<option value="' + k.code + '"' + (k.code === s.settings.currency ? ' selected' : '') + '>' + k.name + '</option>').join('') + '</select></label>' +
      '<p class="tiny muted" style="margin:0">Changing this only changes the symbol. Amounts are not converted.</p></section>' +
      '<section class="card stack"><h3>👫 Players</h3><a class="btn btn-ghost btn-block" href="#/profiles">Switch player</a>' +
      '<button class="btn btn-ghost btn-block" data-act="add-player">＋ Add a player</button></section>' +
      '<section class="card stack"><h3>🧹 Start over</h3>' +
      '<button class="btn btn-danger btn-block" data-act="start-over">🧹 Delete everything & start over</button>' +
      '<p class="tiny muted" style="margin:0">MyMoney uses no real money, has no ads and no chat. Everything stays on this device.</p></section>';
    return CQ.shell(body, { back: 'home', title: '⚙️ Settings', nav: false });
  };
  A['set-mode'] = function (el) { kid().mode = el.dataset.m; CQ.save(); CQ.refresh(); };
  C['set-avatar'] = function (el, e) { kid().avatar = e.target.value; CQ.save(); CQ.refresh(); };
  C['set-currency'] = function (el) { S().settings.currency = el.value; CQ.save(); CQ.toast('Saved ✓'); CQ.refresh(); };
  A['start-over'] = function () {
    CQ.ask('Delete everything and start over? This can\'t be undone.', 'Yes, start over', startOver, { emoji: '🧹', danger: true });
  };
  function startOver() {
    CQ.setState(CQ.emptyState());
    try { localStorage.removeItem('pennypath.v1'); } catch (e) { /* ignore */ }
    CQ.newOnboarding();
    CQ.go('welcome');
  };
})();
