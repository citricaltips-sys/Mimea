async function initializeHistoryPage() {
    try {
        await initializeDatabase();
        if (!window.db) {
            await new Promise(resolve => window.addEventListener('databaseReady', resolve, { once: true }));
        }
        renderHistoryTable();
    } catch (error) {
        console.error('History page init failed:', error);
    }
}

function renderHistoryTable() {
    const historyBody = document.getElementById('history-body');
    if (!historyBody || !window.db) return;

    const transaction = window.db.transaction(['scans'], 'readonly');
    const store = transaction.objectStore('scans');
    const request = store.openCursor(null, 'prev');
    const rows = [];

    request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
            rows.push(cursor.value);
            cursor.continue();
        } else {
            if (rows.length === 0) {
                historyBody.innerHTML = '<tr><td colspan="5" class="empty-state">No scan history available yet.</td></tr>';
                return;
            }

            historyBody.innerHTML = '';
            rows.forEach(entry => {
                const diseaseName = (window.diseaseDatabase?.[window.currentLanguage || 'en']?.diseases?.[entry.diseaseKey]?.name) || entry.diseaseKey.replace(/_/g, ' ');
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${entry.timestamp ? entry.timestamp.split(',')[0] : 'Unknown'}</td>
                    <td>${entry.cropType || (entry.diseaseKey?.includes('tomato') ? 'Tomato' : 'Potato')}</td>
                    <td>${diseaseName}</td>
                    <td>${entry.confidence || 'N/A'}</td>
                    <td><button type="button" class="btn btn-outline">View</button></td>
                `;
                row.querySelector('button').addEventListener('click', () => {
                    alert(`Date: ${entry.timestamp}\nCrop: ${entry.cropType || 'Unknown'}\nDisease: ${diseaseName}\nConfidence: ${entry.confidence || 'N/A'}\nLocation: ${entry.coordinates || 'N/A'}\nNotes: ${entry.feedbackNote || 'None'}`);
                });
                historyBody.appendChild(row);
            });
        }
    };
}

window.addEventListener('DOMContentLoaded', initializeHistoryPage);
