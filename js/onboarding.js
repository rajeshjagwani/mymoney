/* MyMoney — sign-up. Two quick questions: a nickname (not a real name) and Kids or Teens.
   No real names, ages, photos or other personal details are asked for. */
(function () {
  const CQ = window.CQ;
  const R = CQ.routes, A = CQ.actions, F = CQ.forms, I = CQ.inputs;
  const esc = CQ.esc;
  const S = () => CQ.state();
  const IDEAS = ['CoinCaptain', 'PiggyPro', 'SaverStar', 'GoldenGoose', 'PennyNinja', 'CashComet', 'JarHero', 'BudgetBolt'];

  // adding = true when someone adds another player from Settings (skips the welcome screen).
  CQ.newOnboarding = function (adding) { CQ.ob = { step: adding ? 1 : 0, name: '', adding: !!adding }; };

  const say = (text, id) => '<div class="mascot ob-mascot"><button type="button" class="mascot-face" data-act="mascot-poke" data-quiet="1" aria-label="Poke ' + CQ.MASCOT_NAME + '">' +
    CQ.goldsworth() + '</button><div class="bubble"' + (id ? ' id="' + id + '"' : '') + ' aria-live="polite">' + text + '</div></div>';
  const askName = 'Good day! I\'m <b>King Midas</b> 👑 What nickname shall I call you?';

  R.welcome = function () {
    if (!CQ.ob) CQ.newOnboarding(false);
    const ob = CQ.ob, name = esc(ob.name || 'friend');
    const top = ob.step > 0
      ? '<div class="ob-top"><button class="icon-btn" data-act="ob-back" aria-label="Back">←</button>' +
        '<div class="ob-progress" role="progressbar" aria-label="Sign-up progress" aria-valuenow="' + ob.step * 50 + '" aria-valuemin="0" aria-valuemax="100"><div style="width:' + ob.step * 50 + '%"></div></div>' +
        '<span class="ob-count">' + ob.step + '/2</span></div>' : '';
    let inner;
    if (ob.step === 0) {
      inner = '<div class="ob-hero"><button type="button" class="mascot-face ob-hero-mascot" data-act="mascot-poke" data-quiet="1" aria-label="Poke ' + CQ.MASCOT_NAME + '">' + CQ.goldsworth() + '</button>' +
        '<h1>MyMoney</h1><p class="ob-tag">Learn to spend smart, save big and think before you buy — like a true money tycoon! 🎩</p>' +
        '<button class="btn btn-primary btn-big btn-block" data-act="ob-go" autofocus>Let\'s start! 🚀</button></div>';
    } else if (ob.step === 1) {
      const idea = IDEAS[Math.floor(Math.random() * IDEAS.length)];
      inner = say(ob.name ? 'Splendid! Nice to meet you, <b>' + name + '</b>! 🧐' : askName, 'ob-bubble') +
        '<form class="ob-card form" data-form="ob-name"><label class="field"><span class="sr-only">Your nickname</span>' +
        '<input class="ob-input" name="name" maxlength="20" autocomplete="off" required autofocus placeholder="e.g. ' + idea + '" value="' + esc(ob.name) + '" data-input="ob-name"></label>' +
        '<p class="ob-safe">🔒 Use a fun nickname — <b>not</b> your real name.</p>' +
        '<button class="btn btn-primary btn-big btn-block">Next →</button></form>' +
        (ob.adding ? '<a class="link-btn center" href="#/home">Cancel</a>' : '');
    } else {
      inner = say('Which group are you in, <b>' + name + '</b>?') +
        '<div class="ob-card"><div class="group-grid">' +
        '<button type="button" class="group-btn" data-act="ob-group" data-v="kid"><span class="g-emoji">🧸</span><b>Kids</b><span class="muted">under 13</span></button>' +
        '<button type="button" class="group-btn" data-act="ob-group" data-v="teen"><span class="g-emoji">🎧</span><b>Teens</b><span class="muted">13 to 17</span></button>' +
        '</div><p class="tiny muted center" style="margin:0">You can change this later in ⚙️ Settings.</p></div>';
    }
    return '<div class="ob">' + top + '<main class="ob-body">' + inner + '</main></div>';
  };

  function go(step) { CQ.ob.step = step; CQ.sfx('pop'); CQ.refresh(); }
  A['ob-go'] = () => go(1);
  A['ob-back'] = () => {
    if (CQ.ob.step === 1 && CQ.ob.adding) { CQ.ob = null; CQ.go('home'); return; }
    go(CQ.ob.step - 1);
  };
  I['ob-name'] = function (el) {
    const v = el.value.trim();
    CQ.ob.name = v;
    const b = document.getElementById('ob-bubble');
    if (b) b.innerHTML = v ? 'Splendid! Nice to meet you, <b>' + esc(v) + '</b>! 🧐' : askName;
  };
  F['ob-name'] = function (form, fd) {
    const n = (fd.get('name') || '').trim();
    if (!n) return CQ.toast('Pick a nickname first', 'warn');
    CQ.ob.name = n;
    go(2);
  };
  A['ob-group'] = function (el) {
    el.classList.add('sel');
    const ob = CQ.ob;
    // Fresh start: a new empty save. Adding a player: keep everyone else.
    if (!ob.adding || !S().children.length) CQ.setState(CQ.emptyState({ sound: CQ.soundOn() }));
    const s = S();
    const used = s.children.map((c) => c.avatar);
    const free = CQ.AVATARS.filter((a) => used.indexOf(a) === -1);
    const pool = free.length ? free : CQ.AVATARS;
    const k = { id: CQ.uid(), name: ob.name, mode: el.dataset.v === 'teen' ? 'teen' : 'kid', avatar: pool[Math.floor(Math.random() * pool.length)],
      xp: 0, badges: [], lessons: {}, quizDay: '', tourDone: false };
    s.children.push(k);
    s.activeChildId = k.id;
    CQ.save();
    CQ.ob = null;
    CQ.go('home'); // the tour starts by itself for a new player
    setTimeout(() => { CQ.confetti(); CQ.sfx('kaching'); CQ.toast('Welcome, ' + k.name + '! 💰'); }, 150);
  };
})();
