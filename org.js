/* ===== 組織図ページJS ===== */
(() => {
  "use strict";

  const chart = document.getElementById("org-chart");
  const modal = document.getElementById("modal");
  const modalText = document.getElementById("modal-text");
  const closeButton = modal.querySelector(".close");
  let lastFocused = null; // モーダルを閉じたときに戻すフォーカス先

  /* ===== モーダル ===== */
  function openModal(taskName, taskData, trigger) {
    lastFocused = trigger;

    const title = el("h3", "", taskName);
    title.id = "modal-title";
    modalText.replaceChildren(title, el("p", "", taskData.description || "このタスクの情報は現在準備中です。"));

    if (taskData.pdf_link) {
      const link = el("a", "accent-button", "詳細PDFを見る");
      link.href = taskData.pdf_link;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      modalText.append(link);
    }

    modal.classList.add("is-open");
    closeButton.focus();
  }

  function closeModal() {
    modal.classList.remove("is-open");
    if (lastFocused) lastFocused.focus();
  }

  closeButton.addEventListener("click", closeModal);
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });

  /* ===== 部署カード ===== */
  function createMemberSection(dept) {
    const toggle = el("button", "member-toggle", "メンバーを表示 ▼");
    toggle.type = "button";
    toggle.setAttribute("aria-expanded", "false");

    const box = el("div", "member-list-container");
    box.hidden = true;
    box.append(el("span", "manager", `部長：${dept.top}`));
    const list = el("ul", "member-list");
    (dept.members || []).forEach((member) => list.append(el("li", "", member)));
    box.append(list);

    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      box.hidden = isExpanded;
      toggle.setAttribute("aria-expanded", String(!isExpanded));
      toggle.textContent = isExpanded ? "メンバーを表示 ▼" : "メンバーを非表示 ▲";
    });

    return [toggle, box];
  }

  function createTaskList(tasks) {
    const list = el("div", "tasks");
    Object.entries(tasks || {}).forEach(([name, data]) => {
      const button = el("button", "task", name);
      button.type = "button";
      button.addEventListener("click", () => openModal(name, data, button));
      list.append(button);
    });
    return list;
  }

  function renderChart(organization) {
    if (!organization) throw new Error("organization がありません");
    Object.entries(organization).forEach(([name, dept]) => {
      const card = el("section", "dept-card");
      card.append(el("h3", "", name), ...createMemberSection(dept), createTaskList(dept.tasks));
      chart.append(card);
    });
  }

  loadSiteData()
    .then((data) => renderChart(data.organization))
    .catch((error) => {
      console.error("組織データの処理中にエラーが発生しました:", error);
      showLoadError(chart);
    });
})();
