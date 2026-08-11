async function initializeAnalyticsPage() {
    try {
        loadAnalytics();
    } catch (error) {
        console.error('Analytics page init failed:', error);
    }
}

async function loadAnalytics() {
    try {
        const { data, error } = await window.supabase.from('scans').select('*').order('timestamp', { ascending: false });
        if (error) throw error;
        const scans = data || [];
        renderAnalyticsSummary(scans);
        renderAnalyticsChart(scans);
    } catch (error) {
        console.error('Failed to load analytics data:', error);
        renderAnalyticsSummary([]);
        renderAnalyticsChart([]);
    }
}

function renderAnalyticsSummary(scans) {
    const container = document.getElementById('analytics-summary');
    if (!container) return;
    if (scans.length === 0) {
        container.innerHTML = '<div class="analytics-card"><h4>No data yet</h4><p>Perform scans to generate analytics.</p></div>';
        return;
    }

    const total = scans.length;
    const healthy = scans.filter(s => s.diseaseKey?.includes('healthy')).length;
    const diseased = total - healthy;
    const flagged = scans.filter(s => s.userFlagged).length;
    const topDisease = getTopDisease(scans);

    container.innerHTML = `
        <div class="analytics-card"><h4>Total scans</h4><strong>${total}</strong><p>Scans recorded in local history.</p></div>
        <div class="analytics-card"><h4>Healthy plants</h4><strong>${healthy}</strong><p>Scans classified as healthy.</p></div>
        <div class="analytics-card"><h4>Diseased findings</h4><strong>${diseased}</strong><p>Unhealthy plant detections.</p></div>
        <div class="analytics-card"><h4>Flagged results</h4><strong>${flagged}</strong><p>User-reported corrections or feedback.</p></div>
        <div class="analytics-card"><h4>Most common finding</h4><strong>${topDisease}</strong><p>Highest frequency diagnosis from your scans.</p></div>
    `;
}

function getTopDisease(scans) {
    const count = {};
    scans.forEach(entry => {
        const name = (window.diseaseDatabase?.[window.currentLanguage || 'en']?.diseases?.[entry.diseaseKey]?.name) || entry.diseaseKey?.replace(/_/g, ' ') || 'Unknown';
        count[name] = (count[name] || 0) + 1;
    });
    return Object.entries(count).sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';
}

function renderAnalyticsChart(scans) {
    const container = document.getElementById('analytics-chart');
    if (!container) return;
    if (scans.length === 0) {
        container.innerHTML = '<div class="analytics-card"><h4>No chart available</h4><p>Scan more leaves to create trend data here.</p></div>';
        return;
    }

    const counts = {};
    scans.forEach(entry => {
        const name = (window.diseaseDatabase?.[window.currentLanguage || 'en']?.diseases?.[entry.diseaseKey]?.name) || entry.diseaseKey?.replace(/_/g, ' ') || 'Unknown';
        counts[name] = (counts[name] || 0) + 1;
    });

    const total = scans.length;
    container.innerHTML = '';

    Object.entries(counts).sort((a, b) => b[1] - a[1]).forEach(([name, value]) => {
        const percentage = ((value / total) * 100).toFixed(0);
        const row = document.createElement('div');
        row.className = 'analytics-card';
        row.innerHTML = `
            <div style="display:flex; justify-content:space-between; gap:12px; align-items:center;">
                <span>${name}</span>
                <span>${value} (${percentage}%)</span>
            </div>
            <div class="bar-track"><div class="bar-fill" style="width:${percentage}%;"></div></div>
        `;
        container.appendChild(row);
    });
}

window.addEventListener('DOMContentLoaded', initializeAnalyticsPage);
