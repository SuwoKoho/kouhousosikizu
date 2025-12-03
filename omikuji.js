// omikuji.js
const drawBtn = document.getElementById("drawOmikuji");
const resultBox = document.getElementById("omikujiResult");
const backBtn = document.getElementById("backBtn");

const omikujiList = [
  "🎺 大吉：音が神がかり的に合う日！全員が奇跡的にインテンポ！",
  "🥁 中吉：打楽器がちょっと暴れるけど、ノリは最高！",
  "🎷 小吉：サックスのリードが湿るけど気にするな！",
  "🎶 吉：今日の音程はだいたいOK チューナー信じろ！",
  "🎵 凶：テンポが揺れる日。指揮者のせいにしておこう。",
  "💀 大凶：団長に呼び出される予感…。楽譜を忘れたかも？",
  "✨ 超吉：奇跡のハーモニー発生！神に祝福されたサウンド！",
];

const luckyNotes = ["♪", "♩", "♬", "♭", "♯", "𝄞", "𝄢"];

drawBtn.addEventListener("click", () => {
  const fortune = omikujiList[Math.floor(Math.random() * omikujiList.length)];
  const note = luckyNotes[Math.floor(Math.random() * luckyNotes.length)];
  resultBox.innerHTML = `
    <p>${fortune}</p>
    <p>今日のラッキー音符：<b style="font-size:24px;">${note}</b></p>
  `;
});

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});
