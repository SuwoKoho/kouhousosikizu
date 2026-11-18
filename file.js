/* ===== 資料・データページJS ===== */
(() => {
  "use strict";

  const list = document.getElementById("file-list");

  function renderFiles(fileData) {
    if (!fileData) throw new Error("file_data がありません");

    DEPARTMENTS.forEach((name) => {
      const card = el("section", "dept-card");
      card.append(el("h2", "", name));

      const driveLink = fileData[name] && fileData[name].drive_link;
      if (driveLink) {
        const link = el("a", "accent-button", "📁 Google Driveで見る");
        link.href = driveLink;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        card.append(link);
      } else {
        console.warn(`部署「${name}」のリンクが site_data.json にありません。`);
      }

      list.append(card);
    });
  }

  loadSiteData()
    .then((data) => renderFiles(data.file_data))
    .catch((error) => {
      console.error("資料リンクの読み込み中にエラー:", error);
      showLoadError(list, "資料の読み込みに失敗しました。しばらくしてからもう一度お試しください。");
    });
})();
