// 秘密の音符ボタンの処理
let clickCount = 0;
const secretNote = document.getElementById("secretNote");

secretNote.addEventListener("click", () => {
    clickCount++;
    if (clickCount >= 3) {
        window.location.href = "omikuji.html";
    }
});

