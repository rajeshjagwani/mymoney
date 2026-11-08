# 🪙 MyMoney

A money game for kids and teens under 18. No installs and no build step: plain HTML, CSS and JavaScript.

## Online version

MyMoney is published as a web page at https://claude.ai/artifact/U9NDEQi4t9CymFNY6jUaVC. It starts private. Use the page's **Share** menu to choose who can open it, including anyone with the link. `publish.html` is the page used for that link: the same app as `index.html`, without the outer page tags, which the host adds itself. Each person who opens the link gets their own progress, saved in their own browser.

## Run it

Double-click `index.html`, or run the small local server and open http://localhost:8080:

```
powershell -ExecutionPolicy Bypass -File serve.ps1
```

## Meet King Midas 👑

MyMoney's mascot is **King Midas**, a rich old gold coin wearing a jewelled gold crown, with a monocle, curly mustache and bow tie. He's an original character drawn in SVG (in `js/ui.js`). Poke him and he says something posh.

**Player pictures** are rich people made of money: a banknote head and suit, a gold chain with a coin pendant, and a grin with a gold tooth. There are 8 looks (note colour plus a crown, top hat or cap, some with sunglasses). Each new player gets a different one, and you can change it in ⚙️ Settings → *My look*. They're drawn in SVG in `js/ui.js` (`CQ.avatar`), with the looks listed in `js/content.js` (`CQ.LOOKS`).

## How it starts

1. **Welcome screen.** Tap *Let's start!*
2. **A nickname.** Kids are reminded to use a fun nickname, not their real name.
3. **Kids (under 13) or Teens (13–17).** Tap one and you're in.

A short guided tour then points out each part of the home screen. You can replay it with *Take the tour*.

## What's inside

- **📊 Track — Where did all my money go?** Add money in, log what you buy, see charts for the last 7 or 30 days, a timeline with your running balance, tips, and a "guess your top category" quiz.
- **🫙 Save — How do I save for something?** Make a goal, get a weekly plan, and **tap coins to drop them into the jar** (with Undo). Celebrations at 25/50/75/100%, a "What if I skip snacks?" slider, and a "Help me choose" picker when you have several goals. Teen mode adds a bank and interest page with a calculator.
- **🛍️ Decide — Can I buy this?** Answer the Think First questions one at a time, then *Buy it now*, *Wait 48 hours*, or *Skip it*. Buying always takes **two checks**: first *Ask your parents* (the kid shows the screen to a parent and taps "Yes, my parent said OK"), then *Are you sure?* with the wallet before and after. Look back later and mark each buy 👍 good or 😕 regret.
- **📚 Learn:** 13 two-minute lessons with 3-question quizzes, in four sections: Track, Save (including budgets and rainy-day money), Decide, and **Investing** (what investing is, risk and reward, diversifying, starting early, stocks/bonds/funds).
- **📘 Money Guide:** 10 steps on how to save and invest (earn, track, plan, save first, rainy-day money, think before buying, use a bank, invest for the long run, avoid traps, give). Each step can be ticked off, and there's an investing calculator showing money put in vs growth.
- **💡 Money tips:** 135 tips in 8 topics (money basics, spending, saving, asking, investing, earning, banking, staying safe), plus 30 quick points.
  - Most screens have a tip card. Tap *Next* for another.
  - The 30 quick points are listed at the bottom of Midas's Golden Rules.
  - **Midas's Golden Rules** (`#/tips`) lists every tip by topic, with a 🎲 *Surprise me* button. Each new tip read gives +2 XP, and 30 tips earns the 💡 Tip Master badge.
  - Edit the tips in `CQ.POINTS` and `CQ.QUICK` in `js/content.js`.
- **Celebrations:** milestones, badges, level-ups and every 3-star lesson quiz rain money (💵 💰 🪙 💸 💎) down the screen.
- **Sounds** (made in code, no audio files; turn off in ⚙️ Settings, which also has a board to try each one):
  - **KA-CHING!** cash register when you add money, get 3 stars on a quiz, fill a goal, or skip a buy and keep your money.
  - Coin clink into the jar, coins pouring when you save, a whoosh when you spend.
  - Ding / bwomp for right and wrong quiz answers, a level-up fanfare, a sparkle for badges, and coins jingling with the money rain.
- **Tap effects:** every button and card bounces with a glowing ring when tapped. Main buttons also burst coins and sparkles. Turned off when the device is set to reduce motion.
- **Ranks:** every 150 XP you climb a rank, each with a shiny badge: 🥈 Silver → 🥇 Gold → 💠 Platinum → 💎 Diamond. My rewards shows the whole ladder.
- **Fun stuff:** XP, levels, 15 badges (including 📈 Future Investor), saving streaks, a mascot you can poke, and sounds and phone buzzes (can be turned off).
- **Note:** MyMoney teaches money basics. It isn't financial advice, and the investing examples say real returns go up and down.
- **⚙️ Settings:** Kids/Teen mode, change your look, sounds, money type, add or switch players, start over.

## Privacy

- No personal info: only a nickname and Kids/Teen. No real names, ages or photos.
- No real money, no ads, no chat, and no accounts on the internet.
- Everything is saved only in this browser on this device.

## Files

```
index.html          page shell
css/styles.css      all styles
js/content.js       categories, badges, lessons, tips, jokes (edit text here)
js/store.js         saved data, money maths, XP & badges
js/ui.js            formatting, charts, pop-ups, confetti, King Midas SVG
js/screens-kid.js   home, the 3 worlds, lessons, rewards, settings
js/fun.js           sounds, coin drops, guided tour
js/onboarding.js    sign-up (nickname + Kids/Teens)
js/app.js           page switching and taps
serve.ps1           optional local web server
```
