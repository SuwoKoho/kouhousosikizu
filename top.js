(() => {
    "use strict";

    const NOTE_ID = "secretNote";

    const RESET_TIME = 5 * 60 * 1000;

    const CLEANING_START_HOUR = 23;
    const CLEANING_END_HOUR = 24;

    const CLEANING_CLICK_LIMIT = 6;

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
        valentine:[
            "はっぴー ばれんたいん！\nチョコは いくつ もらったんだ？",
            "どうせ ぜろ だろ",
            "なんてな",
            "あまいものの たべすぎには\nちゅういしろよな",
        ],
        hinamaturi:[
            "あかりをつけましょ ぼんぼりに",
            "ひなあられは もう たべたか？",
            "ぴんくと みどりと しろの やつだ！"
        ],
        whiteday:[
            "はっぴー ほわいとでー！",
            "おかえしのおかしには\nいみが あるらしいな",
            "おまえには くっきーを あげよう"
        ],
        tanabata:[
            "きょうは たなばた だな",
            "たんざくに ねがいごとは かいたか？",
            "かなうと いいな"
        ],
        uminohi:[
            "きょうは うみのひ！",
            "まあ おまえには\nかんけいないか",
            "うみの なみのおとって\nなんだか ほっとするよな"
        ],
        yamanohi:[
            "きょうは やまのひ！\nやっほー！",
            "やまの くうきは すんでて おいしいな",
            "ふじさんは もうみなれたか？"
        ],
        shuubun:[
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

        if (hour >= 6 && hour < 9) {
            return "morning";
        }

        if (hour >= 9 && hour < 17) {
            return "afternoon";
        }

        if (hour >= 17 && hour < 21) {
            return "evening";
        }

        if (hour >= 21 && hour < 23) {
            return "night";
        }

        return "lateNight";
    }

    function isCleaningTime() {
        const hour = new Date().getHours();

        return hour >= 23 || hour < 6;
    }

    const note = document.getElementById(NOTE_ID);

    if (!note) {
        return;
    }

    let clickCount = 0;
    let lastClickTime = 0;

    let resetTimer = null;

    let dialog = null;
    let dialogText = null;

    let cleaningOverlay = null;

    let isCleaning = false;

    function createDialog() {
        dialog = document.createElement("div");

        dialog.className = "note-dialog";
        dialog.setAttribute("role", "status");
        dialog.setAttribute("aria-live", "polite");

        dialogText = document.createElement("p");

        dialogText.className = "note-dialog-text";

        dialog.appendChild(dialogText);

        document.body.appendChild(dialog);
    }

    function positionDialog() {
        if (!dialog || !note) {
            return;
        }

        const rect = note.getBoundingClientRect();

        const dialogWidth = Math.min(
            300,
            window.innerWidth - 32
        );

        dialog.style.width = `${dialogWidth}px`;

        let left =
            rect.left +
            rect.width / 2 -
            dialogWidth / 2;

        let top =
            rect.top -
            dialog.offsetHeight -
            18;

        left = Math.max(
            16,
            Math.min(
                left,
                window.innerWidth - dialogWidth - 16
            )
        );

        if (top < 16) {
            top = rect.bottom + 18;
        }

        dialog.style.left = `${left}px`;
        dialog.style.top = `${top}px`;
    }

    function showDialog(message) {
        if (!dialog) {
            createDialog();
        }

        dialogText.textContent = message;

        dialog.classList.add("is-visible");

        requestAnimationFrame(positionDialog);
    }

    function resetConversation() {
        clickCount = 0;
        lastClickTime = 0;

        if (resetTimer) {
            clearTimeout(resetTimer);
            resetTimer = null;
        }

        if (dialog) {
            dialog.classList.remove("is-visible");
        }
    }

    function restartResetTimer() {
        if (resetTimer) {
            clearTimeout(resetTimer);
        }

        resetTimer = setTimeout(() => {
            resetConversation();
        }, RESET_TIME);
    }

    function getCleaningTargets() {
        const selectors = [
            "main",
            "header",
            "section",
            "article",
            ".container",
            ".content",
            ".card",
            "h1",
            "h2",
            "h3",
            "p",
            "li",
            "img"
        ];

        const excludedSelectors = [
            "#secretNote",
            ".navbar",
            "nav",
            "footer",
            ".note-dialog",
            ".cleaning-overlay",
            "script",
            "style"
        ];

        const elements = document.querySelectorAll(
            selectors.join(",")
        );

        return Array.from(elements).filter(element => {

            const isExcluded = excludedSelectors.some(
                selector => {
                    return element.matches(selector);
                }
            );

            if (isExcluded) {
                return false;
            }

            const isInsideExcluded = excludedSelectors.some(
                selector => {
                    return element.closest(selector) !== null;
                }
            );

            if (isInsideExcluded) {
                return false;
            }

            return true;
        });
    }

    function startCleaningMode() {
        if (isCleaning) {
            return;
        }

        isCleaning = true;

        if (resetTimer) {
            clearTimeout(resetTimer);
            resetTimer = null;
        }

        if (dialog) {
            dialog.classList.remove("is-visible");
        }

        const targets = getCleaningTargets();

        const originalStyles = new Map();

        targets.forEach(element => {
            originalStyles.set(element, {
                opacity: element.style.opacity,
                transform: element.style.transform,
                pointerEvents: element.style.pointerEvents
            });
        });

        cleaningOverlay = document.createElement("div");

        cleaningOverlay.className = "cleaning-overlay";

        const messageBox = document.createElement("div");

        messageBox.className = "cleaning-message";

        const title = document.createElement("h2");
        title.style.whiteSpace = "pre-wrap";
        title.textContent =
            "ほんじつの えいぎょうは\nしゅうりょうしました";

        const message = document.createElement("p");

        message.textContent =
            "しごとを やめて はやくねなさい";

        const restoreButton = document.createElement("button");

        restoreButton.className =
            "cleaning-restore-button";

        restoreButton.textContent =
            "きゅうけいする";

        restoreButton.type = "button";

        messageBox.appendChild(title);
        messageBox.appendChild(message);
        messageBox.appendChild(restoreButton);

        cleaningOverlay.appendChild(messageBox);

        document.body.appendChild(cleaningOverlay);

        targets.forEach((element, index) => {
            const rect = element.getBoundingClientRect();

            const dx =
                window.innerWidth / 2 -
                (rect.left + rect.width / 2);

            const dy =
                window.innerHeight / 2 -
                (rect.top + rect.height / 2);

            const delay = Math.min(index * 20, 700);

            element.animate(
                [
                    {
                        opacity: 1,
                        transform: "scale(1)"
                    },
                    {
                        opacity: 0,
                        transform:
                            `translate(${dx}px, ${dy}px) scale(0.05)`
                    }
                ],
                {
                    duration: 900,
                    delay: delay,
                    easing: "ease-in",
                    fill: "forwards"
                }
            );

            element.style.pointerEvents = "none";
        });

        requestAnimationFrame(() => {
            cleaningOverlay.classList.add("is-active");
        });

        restoreButton.addEventListener("click", () => {

            targets.forEach(element => {

                element.getAnimations().forEach(animation => {
                    animation.cancel();
                });

                const original = originalStyles.get(element);

                if (original) {
                    element.style.opacity = original.opacity;
                    element.style.transform = original.transform;
                    element.style.pointerEvents =
                        original.pointerEvents;
                }
            });

            cleaningOverlay.remove();

            cleaningOverlay = null;

            isCleaning = false;

            clickCount = 0;
            lastClickTime = 0;

            if (resetTimer) {
                clearTimeout(resetTimer);
                resetTimer = null;
            }
        });
    }

    /* =====================================
       音符をクリックしたときの処理
    ===================================== */

    function handleNoteClick() {

        // 掃除モード中は処理しない
        if (isCleaning) {
            return;
        }

        const now = Date.now();

        // 最後のクリックから5分以上経過していたら会話を最初からリセット
        if (lastClickTime !== 0 && now - lastClickTime >= RESET_TIME) {
            clickCount = 0;
        }

        lastClickTime = now;
        clickCount++;
        restartResetTimer();

        /* -----------------------------
           1. 深夜の掃除モード判定（最優先）
        ----------------------------- */
        if (isCleaningTime() && clickCount >= CLEANING_CLICK_LIMIT) {
            startCleaningMode();
            return;
        }

        /* -----------------------------
           2. セリフの取得（イベント優先 ＞ 時間帯）
        ----------------------------- */
        const currentTheme = document.documentElement.getAttribute("data-theme");
        let phrases = [];

        // イベントテーマがあり、かつセリフ（中身）が存在すればそれを採用
        if (currentTheme && conversations[currentTheme] && conversations[currentTheme].length > 0) {
            phrases = conversations[currentTheme];
        } else {
            const period = getTimePeriod();
            phrases = conversations[period];
        }

        /* -----------------------------
           3. セリフ終了後のリセット判定
        ----------------------------- */
        if (clickCount > phrases.length) {
            resetConversation();
            return;
        }

        /* -----------------------------
           4. セリフを順番に表示
        ----------------------------- */
        const index = clickCount - 1;
        const message = phrases[index];

        showDialog(message);
    }

    note.addEventListener("click", handleNoteClick);

    window.addEventListener(
        "resize",
        positionDialog
    );

    window.addEventListener(
        "scroll",
        positionDialog,
        true
    );

})();