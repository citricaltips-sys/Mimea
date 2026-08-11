async function initializeHistoryPage() {
    try {
        renderHistoryTable();
    } catch (error) {
        console.error('History page init failed:', error);
    }
}

async function renderHistoryTable() {
    const historyBody = document.getElementById('history-body');
    if (!historyBody) return;

    try {
        const { data, error } = await window.supabase.from('scans').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        const rows = data || [];

        if (rows.length === 0) {
            historyBody.innerHTML = '<tr><td colspan="5" class="empty-state">No scan history available yet.</td></tr>';
            return;
        }

        historyBody.innerHTML = '';
        rows.forEach(entry => {
            const diseaseName = (window.diseaseDatabase?.[window.currentLanguage || 'en']?.diseases?.[entry.diseaseKey]?.name) || entry.diseaseKey?.replace(/_/g, ' ') || 'Unknown';
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
    } catch (error) {
        console.error('Failed to load history:', error);
        historyBody.innerHTML = '<tr><td colspan="5" class="empty-state">Failed to load history.</td></tr>';
    }
}

window.addEventListener('DOMContentLoaded', initializeHistoryPage);
