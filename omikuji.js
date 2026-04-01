/* ===== おみくじページJS ===== */
const drawBtn = document.getElementById("drawOmikuji");
const resultBox = document.getElementById("omikujiResult");
const backBtn = document.getElementById("backBtn");

const omikujiList = [
  "大吉：今日は何をやってもうまくいく！",
  "中吉：音程良すぎて泣きそう。",
  "小吉：ブレスコントロール余裕ですって感じ！",
  "吉：今日の音程はだいたいOK! チューナー信じろ！",
  "凶：小説番号を書いてなくて怒られるかも...確認しておこう！",
  "大凶：日頃の行いかも...？広報の誰かの仕事を手伝えば運気も回復！",
  "末吉：奇跡のハーモニー発生！神に祝福されたサウンド！",
];

const luckyNotes = [
  "ハ長調「純粋・自然・素朴」",
  "ニ長調「輝かしい・勇敢・勝利」",
  "ホ長調「鋭さ・輝き・激しさ」",
  "ヘ長調「穏健・平和・田園的」", 
  "ト長調「優美・快活・穏やかな喜び」",
  "イ長調「愛情・快活・洗練」",
  "ロ長調「非常に明るく鋭い」",
  "嬰ハ長調「甘美・官能的」",
  "嬰ヘ長調「幻想的・曖昧」",
  "変ホ長調「英雄的・威厳・崇高さ」", 
  "変イ長調「高雅・柔和・洗練」",
  "変ロ長調「快活・堂々・社交的」",
  "ハ短調「悲劇的・激しい」",
  "ニ短調「厳粛・崇高な悲しみ」",
  "ホ短調「憂鬱・不安」",
  "ヘ短調「陰鬱・重苦しさ」", 
  "ト短調「不安・哀愁」",
  "イ短調「誠実・素朴な悲しみ」",
  "ロ短調「深い悲哀・孤独」",
  "嬰ハ短調「絶望・嘆き」",
  "嬰ニ短調「悲壮・週末的」",
  "嬰ヘ短調「苦悩・緊張」",
  "嬰ト短調「極度の悲劇性」",
  "嬰イ短調「深い絶望」",
];

drawBtn.addEventListener("click", () => {
  const fortune = omikujiList[Math.floor(Math.random() * omikujiList.length)];
  const note = luckyNotes[Math.floor(Math.random() * luckyNotes.length)];
  resultBox.innerHTML = `
    <p>${fortune}</p>
    <p>今日のおすすめ練習調：<b style="font-size:24px;">${note}</b></p>
  `;
});

backBtn.addEventListener("click", () => {
  window.location.href = "index.html";
});
