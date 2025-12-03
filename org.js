/* ===== [組織図ページアクション設定] (org.js) ===== */
let globalOrgData = {};

document.addEventListener('DOMContentLoaded', () => {

    const departments = document.querySelectorAll('.department');
    const memberToggles = document.querySelectorAll('.member-toggle');

    fetch('site_data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('サイトデータの読み込みに失敗しました');
            }
            return response.json();
        })
        .then(siteData => {
            globalOrgData = siteData.organization;
            
            departments.forEach(dept => {
                const deptName = dept.dataset.deptName;
                const orgData = globalOrgData;

                if (orgData[deptName]) {
                    const data = orgData[deptName];
                    const container = dept.querySelector('.member-list-container');
                    let html = `<span class="manager">部長：${data.top}</span>`;
                    html += `<ul class="member-list">`;
                    data.members.forEach(member => {
                        html += `<li>${member}</li>`;
                    });
                    html += `</ul>`;
                    container.innerHTML = html;
                }
            });
        })
        .catch(error => {
            console.error('組織データの処理中にエラーが発生しました:', error);
            departments.forEach(dept => {
                const container = dept.querySelector('.member-list-container');
                container.innerHTML = '<p style="color: red;">データ読み込みに失敗しました。</p>';
            });
        });

    memberToggles.forEach(button => {
        button.addEventListener('click', () => {
            const container = button.nextElementSibling;
            const isExpanded = button.getAttribute('aria-expanded') === 'true';
            if (isExpanded) {
                container.style.display = 'none';
                button.setAttribute('aria-expanded', 'false');
                button.innerHTML = 'メンバーを表示 ▼';
            }
            else {
                container.style.display = 'block';
                button.setAttribute('aria-expanded', 'true');
                button.innerHTML = 'メンバーを非表示 ▲';
            }
        });
    });

    const tasks = document.querySelectorAll('.task');
    const modal = document.getElementById('modal');
    const modalText = document.getElementById('modal-text');
    const closeBtn = document.querySelector('.close');

    tasks.forEach(task => {
        
        task.addEventListener('click', () => {
            const taskName = task.dataset.taskName;
            const deptName = task.dataset.deptName;
            const orgData = globalOrgData;
            if (orgData[deptName] && orgData[deptName].tasks && orgData[deptName].tasks[taskName]) {
                const taskData = orgData[deptName].tasks[taskName];
                const title = taskName;
                const description = taskData.description;
                const pdfLink = taskData.pdf_link;
                let modalHtml = `<h3>${title}</h3><p>${description}</p>`;
                modalHtml += `<a href="${pdfLink}" target="_blank" class="pdf-button">詳細PDFを見る</a>`;
                modalText.innerHTML = modalHtml;
                modal.style.display = 'block';
            } 
            else {
                modalText.innerHTML = `<h3>情報が見つかりません</h3><p>このタスクの情報は現在準備中です。</p>`;
                modal.style.display = 'block';
            }
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', e => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });

    const toggleElements = document.querySelectorAll('.organization-chart .toggle');

    toggleElements.forEach(function(element) {
        element.addEventListener('click', function(event) {
            let targetList = null;
            let directUL = element.querySelector(':scope > ul');
            if (directUL) targetList = directUL;
            let subListUL = element.querySelector(':scope > .sub-list');
            if (subListUL) targetList = subListUL;
            if (targetList) {
                if (targetList.style.display === 'block') {
                    targetList.style.display = 'none';
                    element.classList.remove('expanded');
                } 
                else {
                    targetList.style.display = 'block';
                    element.classList.add('expanded');
                }
            }
            event.stopPropagation();
        });
    });
});