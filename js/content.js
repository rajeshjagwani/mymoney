/* MyMoney — static content: categories, badges, lessons, tips. */
(function () {
  const CQ = (window.CQ = window.CQ || {});

  CQ.CATEGORIES = [
    { id: 'food', name: 'Food & snacks', emoji: '🍕', color: '#FF8A3D' },
    { id: 'games', name: 'Games', emoji: '🎮', color: '#7C5CFF' },
    { id: 'toys', name: 'Toys & hobbies', emoji: '🧸', color: '#FF5DA2' },
    { id: 'clothes', name: 'Clothes', emoji: '👕', color: '#14B8A6' },
    { id: 'outings', name: 'Outings', emoji: '🎡', color: '#2F6FEB' },
    { id: 'gifts', name: 'Gifts', emoji: '🎁', color: '#E8A600' },
    { id: 'other', name: 'Other', emoji: '✨', color: '#94A3B8' },
  ];
  CQ.cat = (id) => CQ.CATEGORIES.find((c) => c.id === id) || CQ.CATEGORIES[CQ.CATEGORIES.length - 1];

  CQ.SOURCES = [
    { id: 'pocket', kid: 'Pocket money', teen: 'Pocket money', emoji: '💰' },
    { id: 'gift', kid: 'Gift', teen: 'Gift', emoji: '🎁' },
    { id: 'chores', kid: 'Chores', teen: 'Chores', emoji: '🧹' },
    { id: 'job', kid: 'Little job', teen: 'Part-time job', emoji: '💼' },
    { id: 'other', kid: 'Other', teen: 'Other', emoji: '🪙' },
  ];
  CQ.src = (id) => CQ.SOURCES.find((s) => s.id === id) || CQ.SOURCES[CQ.SOURCES.length - 1];

  // scale: rough size of amounts compared with rupees, so lesson examples stay sensible.
  // coins: the tap-to-drop coin buttons shown for that currency.
  CQ.CURRENCIES = [
    { code: 'INR', name: 'Indian rupee (₹)', locale: 'en-IN', scale: 1, snack: 40, coins: [10, 20, 50, 100] },
    { code: 'USD', name: 'US dollar ($)', locale: 'en-US', scale: 0.02, snack: 2, coins: [1, 2, 5, 10] },
    { code: 'EUR', name: 'Euro (€)', locale: 'en-IE', scale: 0.02, snack: 2, coins: [1, 2, 5, 10] },
    { code: 'GBP', name: 'British pound (£)', locale: 'en-GB', scale: 0.02, snack: 2, coins: [1, 2, 5, 10] },
    { code: 'AUD', name: 'Australian dollar (A$)', locale: 'en-AU', scale: 0.03, snack: 3, coins: [1, 2, 5, 10] },
    { code: 'CAD', name: 'Canadian dollar (C$)', locale: 'en-CA', scale: 0.03, snack: 3, coins: [1, 2, 5, 10] },
    { code: 'SGD', name: 'Singapore dollar (S$)', locale: 'en-SG', scale: 0.02, snack: 2, coins: [1, 2, 5, 10] },
    { code: 'AED', name: 'UAE dirham (AED)', locale: 'en-AE', scale: 0.05, snack: 5, coins: [1, 5, 10, 20] },
    { code: 'JPY', name: 'Japanese yen (¥)', locale: 'ja-JP', scale: 2, snack: 150, coins: [100, 500, 1000, 5000] },
  ];

  CQ.GOAL_NAMES = { '🚲': 'New cycle', '🎮': 'Video game', '🎧': 'Headphones', '🧸': 'Toy', '📱': 'Phone', '⚽': 'Football', '🎸': 'Guitar',
    '👟': 'Sneakers', '📚': 'Books', '🎨': 'Art set', '🛹': 'Skateboard', '🎟️': 'Concert ticket', '🧱': 'Lego set', '💻': 'Laptop' };

  // What the mascots say when you poke them.
  CQ.POKES = [
    'Ho ho! Careful with the crown — it\'s solid gold! 👑',
    'I am King Midas, ruler of the Kingdom of Savings! 👑',
    'A true king saves before he spends. Royal rule #1! 📜',
    'Splendid saving, my friend! Simply splendid! 💰',
    '*adjusts monocle* A penny saved is a penny earned. 🧐',
    'Money doesn\'t grow on trees… but it does grow in a savings jar! 🌱',
    'Rich people aren\'t the ones who spend the most — they\'re the ones who save the most! 💎',
    'Hee hee, that tickles! 🤭',
    'Why did the piggy bank go to school? To earn a little interest! 🐷',
    'What do coins say when they meet? “Nice to see you, change!” 🪙',
    'Tip: count your money every Sunday. 🗓️',
    'I love it when you save! 💛',
    'Small coins make big piles! 🏔️',
    'Boop! Did you log your snacks today? 🍪',
    'Saving {50} a day adds up to {18250} in a year! 😮',
  ];

  // Money points: short financial tips, shown on tappable cards in each section and in Midas's Golden Rules.
  // {n} = an amount in rupees, shown in the chosen currency.
  CQ.POINT_SECTIONS = [
    { key: 'home', label: 'Money basics', emoji: '💎' },
    { key: 'spend', label: 'Track', emoji: '📊' },
    { key: 'save', label: 'Save', emoji: '🫙' },
    { key: 'ask', label: 'Decide', emoji: '🛍️' },
    { key: 'learn', label: 'Investing', emoji: '📈' },
    { key: 'earn', label: 'Earning', emoji: '💼' },
    { key: 'bank', label: 'Banking', emoji: '🏦' },
    { key: 'safety', label: 'Staying safe', emoji: '🔒' },
  ];
  CQ.POINTS = {
    home: [
      `Being rich isn't about how much you earn — it's about how much you keep. 💎`,
      `Pay yourself first: put money in your jar the moment it arrives. 🫙`,
      `Money grows when you give it time. That's compound interest! 🌱`,
      `Investing means putting money to work so it can grow over many years. 📈`,
      `If something promises to double your money fast, it's probably a scam. 🚩`,
      `Sharing a little of your money to help others is a great use of money too. 🎁`,
      `A good habit beats a big amount: save something every single week. 🐢`,
      `The best time to start saving was yesterday. The next best time is today! ⏰`,
      `Money is a tool. It works best when you have a plan for it. 🛠️`,
      `Wants are fine — just make sure needs and savings come first. ✅`,
      `Comparing yourself to others is the fastest way to overspend. 🙈`,
      `Give every coin a job: spend it, save it or share it. 🪙`,
      `Learning about money now is a gift to your future self. 🎁`,
      `Rich habits: track, save, wait, invest, repeat. 🔁`,
      `Little and often beats big and rarely. 🐢`,
      `Spend less than you get. That one rule beats almost every money problem. ⚖️`,
      `Write your goals down. People who do are more likely to reach them. ✍️`,
      `Talk about money with your family — it's how everyone gets smarter. 🗣️`,
    ],
    spend: [
      `Write down every buy — even tiny ones. Tiny buys are where money hides. 🔍`,
      `Small monthly fees add up: {99} a month is {1188} a year! 📱`,
      `Bigger packs aren't always cheaper. Compare the price per piece. 🏷️`,
      `A sale only saves money if you were going to buy it anyway. 🛒`,
      `Tapping a card feels less "real" than handing over cash, so people spend more. 💳`,
      `Ask: how many weeks of pocket money does this cost me? ⏳`,
      `Check your spending every week. Spot the leaks, then fix them. 🔧`,
      `Make a list before you shop — and stick to it. 📝`,
      `Shopping when you're bored or sad often leads to buys you regret. 😕`,
      `"Free delivery over {499}" can trick you into buying extra things. 🚚`,
      `Snacks from home cost much less than snacks from a shop. 🥪`,
      `Second-hand books, games and cycles can be just as good for less. ♻️`,
      `Cost per use: a {1000} thing used 100 times costs just {10} a use. 🧮`,
      `In-game purchases and loot boxes are designed to keep you spending. 🎮`,
      `Borrow or swap with a friend instead of buying something you'll use once. 🔄`,
      `Prices ending in 99 are made to look cheaper than they really are. 🏷️`,
      `Cancel subscriptions you don't use — they quietly take money every month. ✂️`,
      `Going out with friends? Agree on a budget before you go. 🎡`,
      `The cheapest choice isn't always best. Think about how long it will last. 🔨`,
      `Your spending shows what you care about. Does it match what matters to you? 💭`,
      `Shops put sweets near the checkout on purpose. Stay strong! 🍬`,
    ],
    save: [
      `Try 3 jars: SPEND for now, SAVE for later, SHARE to help others. 🫙`,
      `The 50/30/20 rule: 50% for needs, 30% for wants, 20% for saving. 🥧`,
      `Keep rainy-day money for surprises, like a broken bottle or a lost bus pass. ☔`,
      `Out of sight, out of mind: keep savings where you can't easily spend them. 🙈`,
      `A savings account pays you interest just for keeping money there. 🏦`,
      `Inflation slowly makes things cost more, so money that grows a little each year helps. 🎈`,
      `Give every goal a price and a date. Then it's a plan, not a wish! 🎯`,
      `Round up: saving the "change" from each buy adds up fast. 🪙`,
      `Name your jars. "Cycle fund" is easier to protect than "savings". 🏷️`,
      `Got birthday money? Try saving at least half of it. 🎂`,
      `Saving {10} a day adds up to {3650} in a year! 📅`,
      `Celebrate milestones — 25%, 50%, 75% — to stay motivated. 🎉`,
      `If you dip into savings, make a plan to put it back. 🔁`,
      `Saving the same amount every week works because you don't have to remember. 🤖`,
      `A goal with a picture is easier to stick to. 🖼️`,
      `Saving isn't about never spending — it's about spending on purpose. 🎯`,
      `Short goals (weeks) and long goals (years) need different plans. 🗓️`,
      `Skipped a want? Put that money straight into a jar. 🙅➡️🫙`,
      `Save first, spend what's left — not the other way round. 🔄`,
      `Saving for something makes getting it feel even better. 😄`,
    ],
    ask: [
      `Sleep on it: most "must-haves" feel less urgent the next day. 😴`,
      `Did you want it before you saw the ad? Ads are made to make you want things. 📺`,
      `Check reviews and return rules before you buy. ⭐`,
      `Every buy has a hidden cost: the other things you can't buy with that money. ⚖️`,
      `Borrowing to buy a want costs extra (interest). Save up first instead. 💸`,
      `Never share passwords, OTPs or card details — even if someone says it's urgent. 🔒`,
      `Too cheap to be true? It might be fake or a scam. 🚩`,
      `Ask "Why do I want this?" If the answer is "everyone has it", think again. 🤔`,
      `Check if you already own something that does the same job. 🏠`,
      `Compare prices in at least 3 places before a big buy. 🔎`,
      `Keep receipts and know the return rules. 🧾`,
      `Feeling rushed? That's a sign to slow down. ⏳`,
      `Influencers are often paid to show products. That's advertising! 📸`,
      `"Buy now, pay later" is still borrowing — and late fees can be big. 💳`,
      `Always ask a parent before buying anything online. 👪`,
      `Look at the full price, including delivery, taxes and fees. 🧮`,
      `If a deal needs you to decide in seconds, it's probably not a good deal. 🚩`,
      `Three small {200} buys cost the same as one {600} buy. ➕`,
      `The happy feeling from new stuff fades fast. Fun times with friends often last longer. 🎈`,
      `Would you still buy it if nobody could see you with it? 🤫`,
    ],
    learn: [
      `Saving = keeping money safe for soon. Investing = growing money for later. 📈`,
      `Higher possible reward usually means higher risk. ⚖️`,
      `Low-cost index funds hold hundreds of companies at once — instant diversifying. 🧺`,
      `Investments go up and down. Long-term investors stay calm and keep going. 🎢`,
      `Under 18? Investing needs a parent or guardian to open the account with you. 👪`,
      `Fees matter: a small yearly fee can eat a big chunk of growth over many years. 🍪`,
      `Investing is a marathon, not a sprint. 🏃`,
      `Dividends are a share of a company's profits paid to its shareholders. 💵`,
      `Stock markets have ups and downs every year, but have grown over long periods in the past. 📈`,
      `Past returns never promise future returns. 🔮`,
      `Rule of 72: at 8% a year, money doubles in about 9 years. 📐`,
      `Investing a fixed amount every month means you buy more when prices are low. 📅`,
      `Don't invest in something you don't understand. 🧐`,
      `"Hot tips" on social media are often hype, not facts. 📱`,
      `Bonds usually swing less than stocks, but tend to grow more slowly. ⚖️`,
      `Gold, property and businesses are other things people invest in. 🏠`,
      `Never invest money you'll need soon. 🚫`,
      `The longer you stay invested, the less short-term drops matter. ⏳`,
      `Investing aims to beat inflation, so your money keeps its buying power. 🎈`,
      `A mutual fund is picked by experts; an index fund simply follows a market list. 🧺`,
    ],
    earn: [
      `Chores, tutoring or selling crafts are ways young people can earn. 🧹`,
      `Earning your own money makes you think twice before spending it. 💪`,
      `Skills = money: drawing, coding, cooking or music can help you earn later. 🧠`,
      `Always ask a parent before taking on a job or selling things online. 👪`,
      `When you charge for something, count your time and materials. ⏱️`,
      `Your first earnings are the perfect time to start saving part of them. 🫙`,
      `Gross pay is before deductions; net pay is what you actually take home. 🧾`,
      `Being on time and reliable gets you more work. ⏰`,
      `Selling things you no longer use can earn money and tidy your room. 📦`,
      `Every job teaches you something — not just how to earn money. 📚`,
      `Doing a little extra makes people want to hire you again. ⭐`,
      `Money earned through hard work feels the best to spend wisely. 🏆`,
    ],
    bank: [
      `A savings account keeps money safe and pays you interest. 🏦`,
      `The interest rate is the % a bank pays you each year for keeping money there. 📊`,
      `A debit card spends your own money; a credit card borrows money you must pay back. 💳`,
      `Credit cards charge high interest if you don't pay the full bill on time. ⚠️`,
      `A fixed (term) deposit locks money for a set time for a higher interest rate. 🔒`,
      `Check your balance regularly so there are no surprises. 👀`,
      `Some ATM withdrawals and transfers have fees — read the rules. 🧾`,
      `Young people can usually open a bank account with a parent or guardian. 👪`,
      `Never write your PIN on your card, and keep it secret. 🙅`,
      `Instant payment apps are quick — always double-check who you're paying. ✅`,
      `Banks protect your money better than a jar under the bed. 🛏️`,
      `Compare banks: interest rates, fees and minimum balances all matter. 🔎`,
    ],
    safety: [
      `Never share passwords, PINs or OTPs — not even with friends. 🔒`,
      `Real banks never ask for your password or OTP by message or call. 🏦`,
      `"You've won a prize! Just pay a small fee" is a classic scam. 🎁🚩`,
      `Don't click links in surprise messages about money. 🔗`,
      `An online friend asking for money or gift cards is a big red flag. 🚩`,
      `Only shop on trusted sites — and ask a parent first. 🛒`,
      `If it sounds too good to be true, it probably is. 🤨`,
      `"Free game currency" generators are scams that steal accounts. 🎮`,
      `Tell a trusted adult right away if something feels wrong. 🗣️`,
      `Use strong, different passwords for every account. 🔑`,
      `Scammers try to rush you. Stop, think, and ask someone you trust. ✋`,
      `Never send money to someone you've only met online. 🙅`,
    ],
  };

  // Short "quick points", shown as chips at the bottom of Midas's Golden Rules.
  CQ.QUICK = ['Save first, spend later 🫙', 'Needs before wants ✅', 'Small buys add up 🍬', 'Time grows money ⏰', 'Spread your eggs 🧺',
    'Fees eat growth 🍪', 'Wait 48 hours ⏳', 'Never share your OTP 🔒', 'Compare 3 prices 🔎', 'Budget = a plan 📝', 'Keep rainy-day money ☔',
    'Interest pays you 🏦', 'Too good = scam 🚩', 'Track every coin 🔍', 'Ask before you buy 👪', 'Pay yourself first 💰', 'Think long term 📈',
    'Ads want your money 📺', 'Goals need dates 🎯', 'Share a little 🎁', 'Earn, save, grow 🌱', 'Cancel unused subscriptions ✂️',
    'Cost per use matters 🧮', 'Stay calm when prices drop 🧘', 'Don\'t buy to impress 🙈', 'Little and often 🐢', 'Rule of 72 📐',
    'Check your balance 👀', 'Know need vs want 🥦', 'Borrowing costs extra 💸'];

  // Player looks: a rich person made of money. note = banknote colour, hat = crown / tophat / cap, shades = sunglasses.
  CQ.LOOKS = {
    m0: { note: '#3FAE6A', dark: '#1F7A45', light: '#BFF0D2', hat: 'crown', shades: true },
    m1: { note: '#8E7CF0', dark: '#5B47C8', light: '#E3DDFF', hat: 'tophat', shades: false },
    m2: { note: '#3D9BE9', dark: '#1F6DB3', light: '#CFE7FF', hat: 'cap', shades: true },
    m3: { note: '#F07C6B', dark: '#C24A3A', light: '#FFE0DA', hat: 'crown', shades: false },
    m4: { note: '#E7B416', dark: '#A87F00', light: '#FFF1BF', hat: 'tophat', shades: true },
    m5: { note: '#2BB3A3', dark: '#16796E', light: '#C9F4EE', hat: 'cap', shades: false },
    m6: { note: '#E86FB0', dark: '#B03C7D', light: '#FFDDEF', hat: 'crown', shades: true },
    m7: { note: '#6C8A9E', dark: '#3F5A6B', light: '#DCE8EF', hat: 'tophat', shades: false },
  };
  CQ.AVATARS = Object.keys(CQ.LOOKS);
  CQ.GOAL_EMOJIS = ['🚲', '🎮', '🎧', '🧸', '📱', '⚽', '🎸', '👟', '📚', '🎨', '🛹', '🎟️', '🧱', '💻'];

  // Ranks are precious ores and gems. After Diamond you stay Diamond (the level number keeps climbing).
  CQ.LEVELS = [
    { name: 'Silver', emoji: '🥈', cls: 'silver' },
    { name: 'Gold', emoji: '🥇', cls: 'gold' },
    { name: 'Platinum', emoji: '💠', cls: 'platinum' },
    { name: 'Diamond', emoji: '💎', cls: 'diamond' },
  ];
  CQ.XP_PER_LEVEL = 150;

  CQ.BADGES = [
    { id: 'first_log', emoji: '📝', name: 'First Tracker', desc: 'Logged your first purchase' },
    { id: 'tracker_10', emoji: '🔍', name: 'Money Detective', desc: 'Logged 10 purchases' },
    { id: 'first_goal', emoji: '🎯', name: 'Goal Setter', desc: 'Made a savings goal' },
    { id: 'm25', emoji: '🌱', name: 'Quarter Way', desc: 'Reached 25% of a goal' },
    { id: 'm50', emoji: '🌿', name: 'Halfway Hero', desc: 'Reached 50% of a goal' },
    { id: 'm75', emoji: '🌳', name: 'Almost There', desc: 'Reached 75% of a goal' },
    { id: 'm100', emoji: '🏆', name: 'Goal Getter', desc: 'Filled a goal jar to 100%' },
    { id: 'streak3', emoji: '🔥', name: 'On Fire', desc: 'Saved 3 weeks in a row' },
    { id: 'thinker', emoji: '🧠', name: 'Think First', desc: 'Finished the Think First checklist' },
    { id: 'patient', emoji: '⏳', name: 'Patience Pro', desc: 'Waited 48 hours before deciding' },
    { id: 'smart_skip', emoji: '🙅', name: 'Smart Skip', desc: 'Decided not to buy something' },
    { id: 'guesser', emoji: '🔮', name: 'Good Guess', desc: 'Guessed your top spending category' },
    { id: 'scholar', emoji: '🎓', name: 'Scholar', desc: 'Finished 3 mini lessons' },
    { id: 'quiz_whiz', emoji: '⭐', name: 'Quiz Whiz', desc: 'Got 3 out of 3 on a lesson quiz' },
    { id: 'investor', emoji: '📈', name: 'Future Investor', desc: 'Finished all the investing lessons' },
    { id: 'tip_master', emoji: '💡', name: 'Tip Master', desc: 'Read 30 money tips' },
  ];

  // The app's sections. label = the short name shown on cards and in Learn.
  CQ.WORLDS = {
    spend: { key: 'spend', label: 'Track', cls: 'w1', mascot: '📊', prop: '🔍', title: 'Where did all my money go?' },
    save: { key: 'save', label: 'Save', cls: 'w2', mascot: '🫙', prop: '💰', title: 'How do I save for something?' },
    ask: { key: 'ask', label: 'Decide', cls: 'w3', mascot: '🛍️', prop: '🛍️', title: 'Can I buy this?' },
    invest: { key: 'invest', label: 'Investing', cls: 'w4', mascot: '📈', prop: '📈', title: 'How do I grow my money?' },
  };

  // {n} inside text = an amount in rupees, shown in the chosen currency (see CQ.fill).
  CQ.TIPS = {
    kid: [
      'Put money in your jar first, then spend what is left! 🫙',
      'Small snacks add up fast. 5 snacks of {40} is {200}! 🍬',
      'Not sure if you want it? Wait a day or two. ⏳',
      'Every coin you save is a step toward your goal! 👣',
      'Write down what you buy — you become a money detective! 🔍',
    ],
    teen: [
      'Pay yourself first: move your savings the day money comes in.',
      'Delivery fees and small add-ons are the sneakiest money leaks.',
      'If an ad says "last chance", that is your cue to slow down.',
      'A 48-hour pause stops most impulse buys.',
      '{60} a day on small stuff is {1800} a month. Worth it?',
    ],
  };

  CQ.LESSONS = [
    {
      id: 'track', world: 'spend', emoji: '🔍', title: 'Every coin tells a story',
      slides: {
        kid: [
          { e: '🕵️', t: 'When you write down what you buy, you become a money detective!' },
          { e: '🍬', t: 'Little buys add up. 5 snacks of {40} = {200}. That could be a new toy!' },
          { e: '🗓️', t: 'Look back each week. What made you happy? What did you forget about?' },
        ],
        teen: [
          { e: '📊', t: "Tracking is the #1 habit of people who are good with money. You can't fix what you don't see." },
          { e: '💧', t: 'Small, frequent buys (snacks, delivery fees, top-ups) are the usual leaks. {60} a day is {1800} a month.' },
          { e: '✂️', t: 'Review weekly: sort spends into "worth it" and "meh". Cut the "meh" first.' },
        ],
      },
      quiz: [
        { q: 'Why should you track what you spend?', o: ['To see where your money goes', 'So you can spend more', "It's a school rule"], a: 0, x: 'Tracking shows you where the money really went.' },
        { q: 'You buy a {50} snack every day for a week. How much is that?', o: ['{50}', '{350}', '{500}'], a: 1, x: '{50} × 7 days = {350}.' },
        { q: 'Which one is a money "leak"?', o: ["Small buys you don't notice", 'Saving in a jar', 'Getting pocket money'], a: 0, x: 'Leaks are small buys that quietly add up.' },
      ],
    },
    {
      id: 'needs', world: 'spend', emoji: '🥦', title: 'Needs vs wants',
      slides: {
        kid: [
          { e: '🥦', t: 'A NEED is something you must have — like food, water and school shoes.' },
          { e: '🎈', t: 'A WANT is something nice to have — like a new toy or a fancy sticker pack.' },
          { e: '🥇', t: 'Needs come first. Wants are fine too — after you plan for them!' },
        ],
        teen: [
          { e: '🚌', t: 'Needs keep life running: food, getting to school, a basic phone plan.' },
          { e: '🎟️', t: 'Wants make life fun: brand-name sneakers, concert tickets, the newest phone.' },
          { e: '👟', t: 'Lots of things are both. You need shoes, but you want the {6000} pair. Ask: which part is the need, and what extra am I paying for?' },
        ],
      },
      quiz: [
        { q: 'Which one is a NEED?', o: ['Water bottle for school', 'A video game', 'Glitter pens'], a: 0, x: 'You need water every day. The others are wants.' },
        { q: 'Which one is a WANT?', o: ['Lunch', 'A second pair of headphones', 'A school bag'], a: 1, x: 'A second pair is nice to have, not a must.' },
        { q: 'School shoes are a need. The fanciest brand is…', o: ['Also a need', 'Partly a want', 'Free'], a: 1, x: 'The need is shoes. The fancy brand is the "want" part.' },
      ],
    },
    {
      id: 'goals', world: 'save', emoji: '🎯', title: 'Saving with a goal',
      slides: {
        kid: [
          { e: '🎯', t: "Saving is easier when you know WHAT you're saving for. Give your goal a name and a picture!" },
          { e: '🧩', t: 'Break it into pieces: a {1200} toy is just {100} a week for 12 weeks.' },
          { e: '🫙', t: 'Pay your jar first! When you get money, put your savings in before you spend.' },
        ],
        teen: [
          { e: '📌', t: 'A goal with a price and a date beats "I\'ll save some money". Make it specific.' },
          { e: '➗', t: 'Price ÷ weeks = what to save each week. {3000} over 10 weeks = {300} a week.' },
          { e: '💸', t: '"Pay yourself first": move savings out the day money comes in. What\'s left is your spending money.' },
        ],
      },
      quiz: [
        { q: 'A {600} game in 6 weeks. How much each week?', o: ['{60}', '{100}', '{600}'], a: 1, x: '{600} ÷ 6 weeks = {100} a week.' },
        { q: 'When is the best time to save?', o: ['Right when you get money', 'After spending', 'At the end of the year'], a: 0, x: 'Save first, then spend what is left.' },
        { q: 'Which goal is easiest to reach?', o: ['"Save some money"', '"Save {1200} for a Lego set in 12 weeks"', '"Be rich"'], a: 1, x: 'A clear price and date makes a plan possible.' },
      ],
    },
    {
      id: 'interest', world: 'save', emoji: '🌱', title: 'Make your money grow',
      slides: {
        kid: [
          { e: '🏦', t: 'A bank keeps your money safe — much safer than under your bed!' },
          { e: '🎁', t: 'Banks even pay you a little extra for keeping money there. That extra is called INTEREST.' },
          { e: '🌱', t: 'The longer you leave it, the more it grows. Like a plant!' },
        ],
        teen: [
          { e: '🏦', t: 'A savings account keeps money safe and pays you interest — a % of your balance each year.' },
          { e: '📈', t: 'At 4% a year, {10000} earns about {400}. Leave it in, and next year you earn interest on {10400}. That\'s compound interest.' },
          { e: '🤝', t: 'In many countries under-18s can open a savings account with a parent or guardian. Ask yours to compare rates and fees.' },
        ],
      },
      quiz: [
        { q: 'What is interest?', o: ['Extra money the bank pays you', 'A bank fee', 'A type of coin'], a: 0, x: 'Interest is money the bank pays you for saving with them.' },
        { q: '{1000} at 5% a year earns about…', o: ['{5}', '{50}', '{500}'], a: 1, x: '5% of {1000} is {50}.' },
        { q: 'Compound interest means…', o: ['You earn interest on your interest too', 'Interest is paid only once', 'Interest goes down every year'], a: 0, x: 'Your interest starts earning interest — it snowballs!' },
      ],
    },
    {
      id: 'think', world: 'ask', emoji: '🧠', title: 'Think before you buy',
      slides: {
        kid: [
          { e: '✋', t: 'Stop and think! Ask: do I need it, or do I just want it?' },
          { e: '📅', t: "Will I still love it next week? If you're not sure, wait." },
          { e: '🏷️', t: 'Look for it cheaper — maybe there is a sale, or a friend can lend it to you.' },
        ],
        teen: [
          { e: '⏰', t: 'Ads and "only 2 left!" timers are designed to make you buy fast. Slow down.' },
          { e: '⏳', t: 'Try the 48-hour rule: if you still want it after 2 days, it\'s probably a real want.' },
          { e: '🔎', t: 'Compare prices across shops and sites, read reviews, and count delivery charges.' },
        ],
      },
      quiz: [
        { q: '"Only 1 hour left!" is designed to make you…', o: ['Buy fast without thinking', 'Save money', 'Feel calm'], a: 0, x: 'Rush messages stop you from thinking it through.' },
        { q: 'The 48-hour rule means…', o: ['Wait 2 days before buying', 'Buy within 2 days', 'Return it in 2 days'], a: 0, x: 'Waiting shows you if you really want it.' },
        { q: 'Best way to find a better price?', o: ['Compare a few shops', 'Buy the first one you see', 'Pick the most expensive'], a: 0, x: 'Comparing often saves money.' },
      ],
    },
    {
      id: 'tradeoff', world: 'ask', emoji: '⚖️', title: 'Every buy is a choice',
      slides: {
        kid: [
          { e: '🪙', t: "Money can only be spent once! If you buy a toy, that money can't go in your goal jar." },
          { e: '⚖️', t: 'That is called a trade-off: picking one thing means not picking another.' },
          { e: '🤔', t: 'Ask: is this worth more to me than getting closer to my goal?' },
        ],
        teen: [
          { e: '⚖️', t: 'Opportunity cost: the real cost of something is what you give up to get it.' },
          { e: '🎧', t: '{1500} on sneakers might mean your headphones arrive 3 weeks later. Is it worth it?' },
          { e: '💬', t: "Before a big buy, talk it through with someone you trust. It helps you make a choice you won't regret." },
        ],
      },
      quiz: [
        { q: 'Money can be spent…', o: ['Only once', 'Twice', 'As many times as you like'], a: 0, x: 'Once it is spent, it is gone.' },
        { q: 'If you buy a {300} toy, your goal jar…', o: ['Misses out on that {300}', 'Gets {300} more', "Doesn't change"], a: 0, x: 'The {300} could have gone into your jar.' },
        { q: 'Opportunity cost is…', o: ['What you give up to get something', "A shop's price tag", 'A discount'], a: 0, x: 'It is the thing you could have had instead.' },
      ],
    },

    /* ----- More saving ----- */
    {
      id: 'budget', world: 'save', emoji: '🥧', title: 'Make a money plan',
      slides: {
        kid: [
          { e: '🫙', t: 'Try 3 jars: SPEND for now, SAVE for later, and SHARE to help others.' },
          { e: '➗', t: 'Got {100}? Maybe {50} to spend, {40} to save and {10} to share.' },
          { e: '🎯', t: 'Your SAVE jar is for goals. No dipping into it for snacks!' },
        ],
        teen: [
          { e: '📐', t: 'A budget is a plan for your money before you spend it — not after it\'s gone.' },
          { e: '🥧', t: 'The 50/30/20 rule: 50% for needs, 30% for wants, 20% for saving and investing.' },
          { e: '📱', t: 'Get {2000} a month? That\'s {1000} for needs, {600} for wants and {400} saved.' },
        ],
      },
      quiz: [
        { q: 'In the 50/30/20 rule, the 20% goes to…', o: ['Wants', 'Saving and investing', 'Snacks'], a: 1, x: '20% is for your future: saving and investing.' },
        { q: 'You get {100}. Using 50/30/20, how much do you save?', o: ['{50}', '{30}', '{20}'], a: 2, x: '20% of {100} is {20}.' },
        { q: 'Why make a budget?', o: ['To spend faster', 'To plan your money before it\'s gone', 'Budgets are only for adults'], a: 1, x: 'A plan tells your money where to go.' },
      ],
    },
    {
      id: 'emergency', world: 'save', emoji: '☔', title: 'Rainy-day money',
      slides: {
        kid: [
          { e: '☔', t: 'Rainy-day money is saved for surprises — like a lost water bottle or broken headphones.' },
          { e: '🛟', t: 'It lets you fix a problem without breaking open your goal jar.' },
          { e: '🔒', t: 'Only use it for real surprises, not for treats!' },
        ],
        teen: [
          { e: '☔', t: 'An emergency fund covers surprises: a cracked phone screen, a lost bus pass, a last-minute school fee.' },
          { e: '📏', t: 'Adults aim for 3–6 months of living costs. For you, even {1000}–{2000} is a great start.' },
          { e: '🚫', t: 'Keep it separate from goal savings, so one surprise doesn\'t wreck all your plans.' },
        ],
      },
      quiz: [
        { q: 'What is an emergency fund for?', o: ['A new video game', 'Unexpected surprises', 'Daily snacks'], a: 1, x: 'It\'s for surprises you didn\'t plan for.' },
        { q: 'Your headphones break. Best money to use?', o: ['Your emergency fund', 'Your goal jar', 'Borrow from a friend'], a: 0, x: 'That\'s exactly what rainy-day money is for.' },
        { q: 'Where should emergency money go?', o: ['In your wallet for snacks', 'Spend it right away', 'Somewhere separate from spending money'], a: 2, x: 'Keep it apart so you don\'t spend it by accident.' },
      ],
    },

    /* ----- Investing ----- */
    {
      id: 'invest-what', world: 'invest', emoji: '🌱', title: 'What is investing?',
      slides: {
        kid: [
          { e: '🌱', t: 'Investing is like planting a seed: you put money in, wait a long time, and it can grow into more money.' },
          { e: '🏢', t: 'When you buy a share, you own a tiny piece of a company! If the company does well, your piece can be worth more.' },
          { e: '⏳', t: 'Investing is for money you won\'t need for a long, long time — many years.' },
        ],
        teen: [
          { e: '📈', t: 'Investing means buying things that can grow in value or pay you money, like shares or funds.' },
          { e: '🧾', t: 'A share (stock) is a slice of a company. Some companies also pay shareholders part of their profits, called dividends.' },
          { e: '⏳', t: 'Saving keeps money safe for soon. Investing is for long-term goals that are 5 or more years away.' },
        ],
      },
      quiz: [
        { q: 'When you buy a share, you own…', o: ['The whole company', 'A tiny piece of a company', 'A bank loan'], a: 1, x: 'A share is a small slice of ownership.' },
        { q: 'Investing is best for money you need…', o: ['Many years from now', 'Tomorrow', 'For lunch today'], a: 0, x: 'Investments can drop in the short term, so give them time.' },
        { q: 'For a goal next month, which is safer?', o: ['Investing', 'Saving', 'They\'re exactly the same'], a: 1, x: 'Short-term money belongs in savings, where it won\'t drop.' },
      ],
    },
    {
      id: 'risk', world: 'invest', emoji: '🎢', title: 'Risk and reward',
      slides: {
        kid: [
          { e: '🎢', t: 'Investments go up AND down, like a roller coaster. That\'s called risk.' },
          { e: '⚖️', t: 'Things that might grow a lot usually have bigger ups and downs too.' },
          { e: '🧘', t: 'Smart investors stay calm when prices drop. They don\'t panic!' },
        ],
        teen: [
          { e: '🎢', t: 'Risk = how much an investment\'s value can swing. Higher possible reward usually means higher risk.' },
          { e: '🏦', t: 'Savings accounts: low risk, low reward. Shares: higher risk, but more growth potential over many years.' },
          { e: '🚩', t: 'Anything that “guarantees” big, fast returns is a red flag. It\'s probably a scam.' },
        ],
      },
      quiz: [
        { q: 'Higher possible reward usually comes with…', o: ['No risk', 'Free money', 'Higher risk'], a: 2, x: 'Bigger possible gains come with bigger possible drops.' },
        { q: 'Someone promises to double your money in a week. It\'s probably…', o: ['A scam', 'A great deal', 'Totally safe'], a: 0, x: 'Real investing never guarantees fast, huge returns.' },
        { q: 'Your investment drops for a few weeks. A long-term investor…', o: ['Panics and sells', 'Stays calm and waits', 'Spends it all'], a: 1, x: 'Short drops are normal. Time usually smooths them out.' },
      ],
    },
    {
      id: 'diversify', world: 'invest', emoji: '🧺', title: 'Don\'t put all your eggs in one basket',
      slides: {
        kid: [
          { e: '🧺', t: 'If you put all your eggs in one basket and drop it, they all break!' },
          { e: '🥚', t: 'Spreading money across many investments means one bad one won\'t ruin everything.' },
          { e: '🍱', t: 'It\'s like a lunch box with lots of different foods instead of just one.' },
        ],
        teen: [
          { e: '🧺', t: 'Diversification = spreading money across many companies, industries and kinds of investments.' },
          { e: '📊', t: 'Index funds and mutual funds hold many companies in one go. That\'s easy diversification.' },
          { e: '🌍', t: 'If one company struggles, the others can keep your money steady.' },
        ],
      },
      quiz: [
        { q: 'Diversifying means…', o: ['Putting everything in one company', 'Keeping money under the bed', 'Spreading money across many investments'], a: 2, x: 'Spread it out so one problem can\'t sink everything.' },
        { q: 'Why diversify?', o: ['So one bad investment doesn\'t ruin everything', 'To guarantee a profit', 'To pay more fees'], a: 0, x: 'It lowers risk. Nothing guarantees a profit.' },
        { q: 'Which is the most diversified?', o: ['Shares in one company', 'A fund holding hundreds of companies', 'One lottery ticket'], a: 1, x: 'A fund spreads your money over many companies.' },
      ],
    },
    {
      id: 'early', world: 'invest', emoji: '⏰', title: 'Start early: time is your superpower',
      slides: {
        kid: [
          { e: '⏰', t: 'The earlier you start, the more time your money has to grow.' },
          { e: '❄️', t: 'Growth adds on top of growth, like a snowball rolling downhill and getting bigger.' },
          { e: '🐢', t: 'Slow and steady wins: small amounts, often, for a long time.' },
        ],
        teen: [
          { e: '⏰', t: 'Compounding: your returns start earning returns of their own. Time matters more than how much you start with.' },
          { e: '📐', t: 'Rule of 72: divide 72 by the yearly return to see how many years it takes to double. At 8%, about 9 years.' },
          { e: '🚀', t: 'Putting the same amount in each month, starting 10 years earlier can more than double what you have by retirement.' },
        ],
      },
      quiz: [
        { q: 'Compound growth means…', o: ['Paying extra fees', 'Earning returns on your returns', 'Money stays the same'], a: 1, x: 'Your growth starts growing too — like a snowball.' },
        { q: 'Rule of 72: at 6% a year, money doubles in about…', o: ['6 years', '72 years', '12 years'], a: 2, x: '72 ÷ 6 = 12 years.' },
        { q: 'Your biggest investing superpower as a young person is…', o: ['Time', 'Luck', 'Spending more'], a: 0, x: 'You have more years for your money to grow.' },
      ],
    },
    {
      id: 'types', world: 'invest', emoji: '🏢', title: 'Stocks, bonds and funds',
      slides: {
        kid: [
          { e: '🏢', t: 'Stocks: you own a tiny piece of a company.' },
          { e: '🤝', t: 'Bonds: you lend money to a company or government, and they pay you back with a little extra.' },
          { e: '🧺', t: 'Funds: a big basket holding lots of stocks or bonds together.' },
        ],
        teen: [
          { e: '🏢', t: 'Stocks (shares): ownership in a company. Higher risk, more long-term growth potential.' },
          { e: '🤝', t: 'Bonds: loans to governments or companies that pay you interest. Usually steadier than stocks.' },
          { e: '🧺', t: 'Mutual funds and index funds pool money into many investments. Low-cost index funds are a popular first step. Under 18? A parent or guardian opens the account with you.' },
        ],
      },
      quiz: [
        { q: 'A bond is…', o: ['Owning a company', 'Lending money and getting paid back with interest', 'A type of coin'], a: 1, x: 'With a bond, you\'re the lender.' },
        { q: 'An index fund…', o: ['Holds many companies at once', 'Is one company\'s stock', 'Is a piggy bank'], a: 0, x: 'It follows a whole market, so you own a bit of many companies.' },
        { q: 'Under 18 and want to invest?', o: ['You never can', 'Use a stranger\'s account', 'Do it with a parent or guardian'], a: 2, x: 'A parent or guardian can open and manage the account with you.' },
      ],
    },
  ];
})();
