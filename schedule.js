"use strict";

const DEPARTMENT_COLORS = {
  "広報部": "#20aec2",
  "制作・管理部": "#e87955",
  "許可申請部": "#4c9b78",
  "その他": "#77858b"
};

const $ = (id) => document.getElementById(id);

function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  date.setHours(0, 0, 0, 0);
  return date;
}

function daysBetween(from, to) {
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}

function formatDate(date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

function getColor(department) {
  return DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS["その他"];
}

document.addEventListener("DOMContentLoaded", initschedule);

let currentTasks = [];
let activeFilter = "すべて";

async function initschedule() {
  const select = $("event-select");
  const status = $("schedule-status");

  try {
    const response = await fetch("./site_data.json", { cache: "no-store" });
    if (!response.ok) throw new Error("site_data.json を読み込めませんでした");

    const data = await response.json();
    const events = Array.isArray(data.events) ? data.events : [];

    if (events.length === 0) {
      status.textContent = "site_data.json にイベントが登録されていません。";
      return;
    }

    select.replaceChildren();
    events.forEach((event, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = event.name || `イベント ${index + 1}`;
      select.append(option);
    });

    select.addEventListener("change", () => renderEvent(events[Number(select.value)]));
    renderEvent(events[0]);

  } catch (error) {
    console.error(error);
    status.hidden = false;
    status.textContent = "読み込みに失敗しました。site_data.json が同じフォルダにあるか確認してください。";
  }
}

function renderEvent(event) {
  const canvas = $("schedule-canvas");
  const status = $("schedule-status");
  const legend = $("schedule-legend");
  const summary = $("event-summary");

  canvas.replaceChildren();
  if (legend) legend.replaceChildren();

  const finish = parseDate(event.eventDate);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (finish) {
    const remainingDays = daysBetween(today, finish);
    summary.textContent = remainingDays >= 0
      ? `本番まであと ${remainingDays} 日`
      : `本番日から ${Math.abs(remainingDays)} 日経過`;
  } else {
    summary.textContent = "";
  }

  // タスクの解析と締め切り日順（昇順）ソート
  const rawTasks = Array.isArray(event.tasks) ? event.tasks : [];
  currentTasks = rawTasks
    .map(t => ({
      ...t,
      endDateObj: parseDate(t.endDate)
    }))
    .filter(t => t.name && t.endDateObj)
    .sort((a, b) => a.endDateObj.getTime() - b.endDateObj.getTime());

  // 部署フィルターボタンの生成
  const depts = ["すべて", "広報部", "制作・管理部", "許可申請部", "その他"];
  activeFilter = "すべて";

  if (legend) {
    const filterContainer = document.createElement("div");
    filterContainer.className = "filter-btn-group";

    depts.forEach(dept => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = `filter-btn ${dept === activeFilter ? "active" : ""}`;
      btn.textContent = dept;
      
      if (dept !== "すべて") {
        btn.style.setProperty("--dept-color", getColor(dept));
      }

      btn.addEventListener("click", () => {
        activeFilter = dept;
        filterContainer.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderTaskList(today);
      });

      filterContainer.append(btn);
    });

    legend.append(filterContainer);
  }

  renderTaskList(today);
  status.hidden = true;
}

function renderTaskList(today) {
  const canvas = $("schedule-canvas");
  canvas.replaceChildren();

  const filteredTasks = activeFilter === "すべて"
    ? currentTasks
    : currentTasks.filter(t => (t.department || "その他") === activeFilter);

  if (filteredTasks.length === 0) {
    const emptyMsg = document.createElement("p");
    emptyMsg.className = "empty-msg";
    emptyMsg.textContent = "該当する仕事はありません。";
    canvas.append(emptyMsg);
    return;
  }

  const listContainer = document.createElement("div");
  listContainer.className = "task-list-container";

  let todayLineInserted = false;

  filteredTasks.forEach(task => {
    const diff = daysBetween(today, task.endDateObj);

    // 「今日」の区切り線を日付順の適切な位置に挿入
    if (!todayLineInserted && task.endDateObj >= today) {
      const todayCard = document.createElement("div");
      todayCard.className = "today-divider";
      todayCard.innerHTML = `<span>今日（${formatDate(today)}）▼</span>`;
      listContainer.append(todayCard);
      todayLineInserted = true;
    }

    // タスクカード
    const card = document.createElement("div");
    card.className = `task-card ${diff < 0 ? "past" : diff === 0 ? "today-due" : "future"}`;
    card.style.setProperty("--dept-color", getColor(task.department || "その他"));

    // 左側：締切日・カウントダウン
    const dateBox = document.createElement("div");
    dateBox.className = "task-date-box";

    const dateStr = document.createElement("span");
    dateStr.className = "task-date";
    dateStr.textContent = formatDate(task.endDateObj);

    const badge = document.createElement("span");
    badge.className = "task-badge";

    if (diff > 0) {
      badge.textContent = `あと ${diff} 日`;
      badge.classList.add("badge-future");
    } else if (diff === 0) {
      badge.textContent = "本日締切";
      badge.classList.add("badge-today");
    } else {
      badge.textContent = `${Math.abs(diff)} 日経過`;
      badge.classList.add("badge-past");
    }

    dateBox.append(dateStr, badge);

    // 右側：仕事名と部署タグ
    const contentBox = document.createElement("div");
    contentBox.className = "task-content-box";

    const deptTag = document.createElement("span");
    deptTag.className = "task-dept-tag";
    deptTag.textContent = task.department || "その他";

    const taskTitle = document.createElement("h3");
    taskTitle.className = "task-title";
    taskTitle.textContent = task.name;

    contentBox.append(deptTag, taskTitle);

    card.append(dateBox, contentBox);
    listContainer.append(card);
  });

  // 全タスクが過去の日付の場合、末尾に「今日」を入れる
  if (!todayLineInserted) {
    const todayCard = document.createElement("div");
    todayCard.className = "today-divider";
    todayCard.innerHTML = `<span>今日（${formatDate(today)}）▼</span>`;
    listContainer.append(todayCard);
  }

  canvas.append(listContainer);
}