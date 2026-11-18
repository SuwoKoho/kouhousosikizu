/* ===== トップページJS（音符の会話・掃除モード・イベント画像） ===== */
(() => {
  "use strict";

  const RESET_TIME = 5 * 60 * 1000;   // 最後のクリックから会話をリセットするまでの時間
  const CLEANING_START_HOUR = 23;     // 掃除モードが使える時間帯（23:00〜翌5:59）
  const CLEANING_END_HOUR = 6;
  const CLEANING_CLICK_LIMIT = 6;     // この回数クリックすると掃除モードが始まる

  const note = document.getElementById("secretNote");
  if (!note) return;

  /* ===== イベントイメージ（images/<テーマ名>.png を表示） ===== */
  const theme = document.documentElement.dataset.theme;
  const eventVisual = document.getElementById("event-visual");
  if (theme && eventVisual) {
    eventVisual.style.backgroundImage = `url("images/${theme}.png")`;
    eventVisual.classList.add("is-active");
  }

  /* ===== セリフ ===== */
  const conversations = {
    // 朝：6:00〜8:59
    morning: [
      "おはよう\nあさからしごとなんて かんしんだな",
      "じゅぎょうには\nちゃんといくんだぞ",
      "きょうも げんきに がんばれよ"
    ],

    // 昼：9:00〜16:59
    afternoon: [
      "こんにちは\nなにしてんだ？",
      "きょうも おまえにあえて うれしいよ",
      "しごとは じゅんちょうかな？",
      "ときには\nきゅうけいも たいせつだぞ",
      "がんばれ"
    ],

    // 夕方：17:00〜20:59
    evening: [
      "おつかれさま",
      "そろそろ ひが くれるころかな？",
      "きょうの れんしゅうは どうだった？",
      "しごとも そこそこにな"
    ],

    // 夜：21:00〜22:59
    night: [
      "やぁ\nまだ しごとしてるのか？",
      "こんなじかんまで\nおつかれさまだが...",
      "ちゃんと きゅうけいは してるか？",
      "そろそろ やすんでも\nいいんじゃないか？",
      "23じをこえたら\nやめるんだぞ？"
    ],

    // 深夜：23:00〜翌5:59
    lateNight: [
      "...こんばんは",
      "こんな じかんまで\nこうほうの しごとなんて...",
      "まさか とけいが よめないのか？",
      "そろそろ ほーむぺーじを\nとじたらどうかな。",
      "...おい、\nまだしごとをつづけるつもりか？"
    ],

    // --- イベント専用セリフ（data-themeの値と一致させる） ---
    newyear: [
      "あけまして おめでとう",
      "おとしだまは だいじに つかえよ",
      "こたつで ゴロゴロしても じゃまなだけだ",
      "おみくじは ひいたか？\nオイラは だいきち だったぞ",
    ],
    setubun: [
      "おには～ そと！\nふくは～ うち！",
      "オイラに まめを なげるなよ？\nおにじゃ ないんだからな！",
      "えほうまきを たべるときは\nしゃべっちゃ だめなんだぞ",
      "...あまった まめは\nたべてあげても いいぞ"
    ],
    valentine: [
      "はっぴー ばれんたいん！\nチョコは いくつ もらったんだ？",
      "どうせ ぜろ だろ",
      "なんてな",
      "あまいものの たべすぎには\nちゅういしろよな",
    ],
    hinamaturi: [
      "あかりをつけましょ ぼんぼりに",
      "ひなあられは もう たべたか？",
      "ぴんくと みどりと しろの やつだ！"
    ],
    whiteday: [
      "はっぴー ほわいとでー！",
      "おかえしのおかしには\nいみが あるらしいな",
      "おまえには くっきーを あげよう"
    ],
    tanabata: [
      "きょうは たなばた だな",
      "たんざくに ねがいごとは かいたか？",
      "かなうと いいな"
    ],
    uminohi: [
      "きょうは うみのひ！",
      "まあ おまえには\nかんけいないか",
      "うみの なみのおとって\nなんだか ほっとするよな"
    ],
    yamanohi: [
      "きょうは やまのひ！\nやっほー！",
      "やまの くうきは すんでて おいしいな",
      "ふじさんは もうみなれたか？"
    ],
    shuubun: [
      "きょうは しゅうぶんのひ！\nすっかり あきらしく なってきたな",
      "まだ ぜんぜんあついって？\nまあ こまかいことは きにするな",
      "あきは おいしいものが おおくて\nついつい たべすぎちゃうな..."
    ],
    halloween: [
      "とりっく おあ とりーと！\nおかしを くれないと いたずらするぞ",
      "きょうは はろうぃんだ",
      "れんしゅうの あいまに\nおかしでも たべたらどうだ？"
    ],
    christmas: [
      "めりー くりすます！",
      "さんたさんは もう きたかな？",
      "すてきな くりすますに なるといいな"
    ]
  };

  function getTimePeriod() {
    const hour = new Date().getHours();
    if (hour >= 6 && hour < 9) return "morning";
    if (hour >= 9 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    if (hour >= 21 && hour < 23) return "night";
    return "lateNight";
  }

  function isCleaningTime() {
    const hour = new Date().getHours();
    return hour >= CLEANING_START_HOUR || hour < CLEANING_END_HOUR;
  }

  /* ===== 状態 ===== */
  let clickCount = 0;
  let lastClickTime = 0;
  let resetTimer = null;
  let dialog = null;
  let dialogText = null;
  let isCleaning = false;

  function clearResetTimer() {
    if (resetTimer) {
      clearTimeout(resetTimer);
      resetTimer = null;
    }
  }

  /* ===== 吹き出し ===== */
  function createDialog() {
    dialog = el("div", "note-dialog");
    dialog.setAttribute("role", "status");
    dialog.setAttribute("aria-live", "polite");
    dialogText = el("p", "note-dialog-text");
    dialog.append(dialogText);
    document.body.append(dialog);
  }

  function positionDialog() {
    if (!dialog) return;

    const rect = note.getBoundingClientRect();
    const width = Math.min(300, window.innerWidth - 32);
    dialog.style.width = `${width}px`;

    const noteCenter = rect.left + rect.width / 2;
    const left = Math.max(16, Math.min(noteCenter - width / 2, window.innerWidth - width - 16));
    let top = rect.top - dialog.offsetHeight - 18;
    if (top < 16) top = rect.bottom + 18;

    dialog.style.left = `${left}px`;
    dialog.style.top = `${top}px`;

    // 三角形が音符を指すように位置を合わせる
    const arrowLeft = Math.max(12, Math.min(noteCenter - left - 6, width - 24));
    dialog.style.setProperty("--arrow-left", `${arrowLeft}px`);
  }

  function showDialog(message) {
    if (!dialog) createDialog();
    dialogText.textContent = message;
    dialog.classList.add("is-visible");
    requestAnimationFrame(positionDialog);
  }

  function hideDialog() {
    if (dialog) dialog.classList.remove("is-visible");
  }

  function resetConversation() {
    clickCount = 0;
    lastClickTime = 0;
    clearResetTimer();
    hideDialog();
  }

  function restartResetTimer() {
    clearResetTimer();
    resetTimer = setTimeout(resetConversation, RESET_TIME);
  }

  /* ===== 掃除モード ===== */
  function startCleaningMode() {
    if (isCleaning) return;
    isCleaning = true;
    clearResetTimer();
    hideDialog();

    const restoreButton = el("button", "cleaning-restore-button", "きゅうけいする");
    restoreButton.type = "button";

    const message = el("div", "cleaning-message");
    message.append(
      el("h2", "", "ほんじつの えいぎょうは\nしゅうりょうしました"),
      el("p", "", "しごとを やめて はやくねなさい"),
      restoreButton
    );

    const overlay = el("div", "cleaning-overlay");
    overlay.append(message);
    document.body.append(overlay);

    // 画面中央に吸い込まれていく動き
    const targets = document.querySelectorAll(".top-main > *");
    targets.forEach((element, index) => {
      const rect = element.getBoundingClientRect();
      const dx = window.innerWidth / 2 - (rect.left + rect.width / 2);
      const dy = window.innerHeight / 2 - (rect.top + rect.height / 2);
      element.animate(
        [
          { opacity: 1, transform: "scale(1)" },
          { opacity: 0, transform: `translate(${dx}px, ${dy}px) scale(0.05)` },
        ],
        { duration: 900, delay: Math.min(index * 20, 700), easing: "ease-in", fill: "forwards" }
      );
    });

    requestAnimationFrame(() => overlay.classList.add("is-active"));

    restoreButton.addEventListener("click", () => {
      targets.forEach((element) => element.getAnimations().forEach((animation) => animation.cancel()));
      overlay.remove();
      isCleaning = false;
      resetConversation();
    });
  }

  /* ===== 音符をクリックしたときの処理 ===== */
  function handleNoteClick() {
    if (isCleaning) return;

    const now = Date.now();
    // 最後のクリックから5分以上経っていたら、会話を最初からやり直す
    if (lastClickTime !== 0 && now - lastClickTime >= RESET_TIME) clickCount = 0;
    lastClickTime = now;
    clickCount++;
    restartResetTimer();

    // 1. 深夜は、一定回数クリックで掃除モード（最優先）
    if (isCleaningTime() && clickCount >= CLEANING_CLICK_LIMIT) {
      startCleaningMode();
      return;
    }

    // 2. セリフの選択（イベント日のセリフ ＞ 時間帯のセリフ）
    const eventPhrases = conversations[theme];
    const phrases = eventPhrases && eventPhrases.length > 0 ? eventPhrases : conversations[getTimePeriod()];

    // 3. セリフを言い終えたら会話を終了
    if (clickCount > phrases.length) {
      resetConversation();
      return;
    }

    // 4. セリフを順番に表示
    showDialog(phrases[clickCount - 1]);
  }

  note.addEventListener("click", handleNoteClick);
  window.addEventListener("resize", positionDialog);
  window.addEventListener("scroll", positionDialog, true);
})();
