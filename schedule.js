/* ===== スケジュールページJS ===== */
(() => {
  "use strict";

  // 部署ごとの色（部署名は common.js の DEPARTMENTS と同じにします）
  const DEPARTMENT_COLORS = {
    "広報部": "#20aec2",
    "制作・管理部": "#e87955",
    "許可申請部": "#4c9b78",
    "その他": "#77858b",
  };
  const FILTER_ALL = "すべて";

  let currentTasks = [];
  let activeFilter = FILTER_ALL;

  const byId = (id) => document.getElementById(id);

  /* ===== 日付の道具 ===== */
  // "2026-09-13" のような文字列を日付にする（月・日は1桁でも可。日付として正しくなければ null）
  function parseDate(value) {
    const match = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(value);
    if (!match) return null;
    const [year, month, day] = match.slice(1).map(Number);
    const date = new Date(year, month - 1, day);
    const isValid = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
    return isValid ? date : null;
  }

  function getToday() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  function daysBetween(from, to) {
    return Math.round((to.getTime() - from.getTime()) / 86400000);
  }

  function formatDate(date) {
    return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
  }

  function getDepartment(task) {
    return task.department || "その他";
  }

  function getColor(department) {
    return DEPARTMENT_COLORS[department] || DEPARTMENT_COLORS["その他"];
  }

  function setStatus(message) {
    const status = byId("schedule-status");
    status.textContent = message;
    status.hidden = !message;
  }

  /* ===== 表示を作る部品 ===== */
  function createTodayDivider(today) {
    const divider = el("div", "today-divider");
    divider.append(el("span", "", `今日（${formatDate(today)}）▼`));
    return divider;
  }

  function createTaskCard(task, today) {
    const diff = daysBetween(today, task.endDateObj);
    const card = el("div", `task-card ${diff < 0 ? "past" : diff === 0 ? "today-due" : "future"}`);
    card.style.setProperty("--dept-color", getColor(getDepartment(task)));

    // 左側：締切日とカウントダウン
    const badge = el("span", "task-badge");
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
    const dateBox = el("div", "task-date-box");
    dateBox.append(el("span", "task-date", formatDate(task.endDateObj)), badge);

    // 右側：部署タグと仕事名
    const contentBox = el("div", "task-content-box");
    contentBox.append(el("span", "task-dept-tag", getDepartment(task)), el("h3", "task-title", task.name));

    card.append(dateBox, contentBox);
    return card;
  }

  function renderTaskList() {
    const container = byId("task-list");
    container.replaceChildren();

    const tasks = activeFilter === FILTER_ALL
      ? currentTasks
      : currentTasks.filter((task) => getDepartment(task) === activeFilter);

    if (tasks.length === 0) {
      container.append(el("p", "empty-msg", "該当する仕事はありません。"));
      return;
    }

    const today = getToday();
    const list = el("div", "task-list-container");
    let isTodayLineInserted = false;

    tasks.forEach((task) => {
      // 「今日」の線を、日付順の正しい位置に入れる
      if (!isTodayLineInserted && task.endDateObj >= today) {
        list.append(createTodayDivider(today));
        isTodayLineInserted = true;
      }
      list.append(createTaskCard(task, today));
    });

    // すべての仕事が過去の日付なら、いちばん下に「今日」の線を入れる
    if (!isTodayLineInserted) list.append(createTodayDivider(today));

    container.append(list);
  }

  function renderFilters() {
    const group = el("div", "filter-btn-group");
    activeFilter = FILTER_ALL;

    [FILTER_ALL, ...DEPARTMENTS].forEach((department) => {
      const button = el("button", "filter-btn", department);
      button.type = "button";
      if (department === activeFilter) button.classList.add("active");
      if (department !== FILTER_ALL) button.style.setProperty("--dept-color", getColor(department));

      button.addEventListener("click", () => {
        activeFilter = department;
        group.querySelectorAll(".filter-btn").forEach((other) => other.classList.remove("active"));
        button.classList.add("active");
        renderTaskList();
      });
      group.append(button);
    });

    byId("department-filter").replaceChildren(group);
  }

  /* ===== イベントの表示 ===== */
  function renderEvent(event) {
    // 本番までの日数
    const eventDate = parseDate(event.eventDate);
    const summary = byId("event-summary");
    if (eventDate) {
      const remaining = daysBetween(getToday(), eventDate);
      summary.textContent = remaining >= 0
        ? `本番まであと ${remaining} 日`
        : `本番日から ${Math.abs(remaining)} 日経過`;
    } else {
      summary.textContent = "";
    }

    // 日付が正しい仕事だけを、締切日の早い順に並べる
    const tasks = (Array.isArray(event.tasks) ? event.tasks : [])
      .map((task) => ({ ...task, endDateObj: parseDate(task.endDate) }));
    tasks
      .filter((task) => task.name && !task.endDateObj)
      .forEach((task) => console.warn(`「${task.name}」は締切日が正しくないため表示しません: ${task.endDate}`));
    currentTasks = tasks
      .filter((task) => task.name && task.endDateObj)
      .sort((a, b) => a.endDateObj.getTime() - b.endDateObj.getTime());

    renderFilters();
    renderTaskList();
    setStatus("");
  }

  /* ===== 初期化 ===== */
  async function init() {
    const select = byId("event-select");

    try {
      const data = await loadSiteData();
      const events = Array.isArray(data.events) ? data.events : [];

      if (events.length === 0) {
        setStatus("イベントが登録されていません。");
        return;
      }

      select.replaceChildren();
      events.forEach((event, index) => {
        const option = el("option", "", event.name || `イベント ${index + 1}`);
        option.value = String(index);
        select.append(option);
      });

      select.addEventListener("change", () => renderEvent(events[Number(select.value)]));
      renderEvent(events[0]);
    } catch (error) {
      console.error(error);
      setStatus("読み込みに失敗しました。しばらくしてからもう一度お試しください。");
    }
  }

  init();
})();
