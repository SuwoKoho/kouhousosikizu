/* ===== 過去のデータページJS ===== */
document.addEventListener('DOMContentLoaded', () => {
    const departments = document.querySelectorAll('.file-department');
    const loadingError = document.getElementById('loading-error');

    fetch('site_data.json')
        .then(response => {
            if (!response.ok) throw new Error('JSON読み込みに失敗しました');
            return response.json();
        })
        .then(siteData => {
            const fileData = siteData.file_data;
            if (!fileData) throw new Error('file_dataが存在しません');
            departments.forEach(dept => {
                const deptName = dept.dataset.deptName;
                const deptInfo = fileData[deptName];
                if (deptInfo && deptInfo.drive_link) { 
                    const html = `
                        <div class="drive-link-box"> 
                            <a href="${deptInfo.drive_link}"
                                target="_blank"
                                class="drive-link"
                                rel="noopener noreferrer">
                                📁 Google Driveで見る
                            </a>
                        </div>
                    `;
                    dept.insertAdjacentHTML('beforeend', html); 
                }
                else {
                    console.warn(`部署「${deptName}」のリンクがJSONに存在しません。`);
                }
            });
        })
        .catch(error => {
            console.error('資料リンクの読み込み中にエラー:', error);
            loadingError.style.display = 'block';
        });
});