let map = null;
let markersCluster = null;
let heatLayer = null;
let currentHeatData = [];
let userLocation = null;
let outbreakReports = [];

const sampleReports = [
    { diseaseKey: 'tomato late blight', diseaseName: 'Tomato Late Blight', confidence: '92%', latitude: -1.286, longitude: 36.817, notes: 'Reports from Rongai estates', timestamp: new Date().toISOString(), source: 'community', syncStatus: 'synced', isOutbreak: true },
    { diseaseKey: 'tomato early blight', diseaseName: 'Tomato Early Blight', confidence: '84%', latitude: -1.310, longitude: 36.780, notes: 'Spots visible in low-lying beds', timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), source: 'community', syncStatus: 'synced', isOutbreak: true },
    { diseaseKey: 'potato late blight', diseaseName: 'Potato Late Blight', confidence: '89%', latitude: -0.855, longitude: 37.665, notes: 'Observed after a wet morning', timestamp: new Date(Date.now() - 5 * 86400000).toISOString(), source: 'community', syncStatus: 'synced', isOutbreak: true }
];

function normalizeOutbreakReport(report) {
    return {
        ...report,
        diseaseKey: report.diseaseKey || report.disease_key || '',
        diseaseName: report.diseaseName || report.disease_name || '',
        latitude: report.latitude ?? null,
        longitude: report.longitude ?? null,
        notes: report.notes || '',
        timestamp: report.timestamp || report.created_at || new Date().toISOString(),
        source: report.source || 'community',
        syncStatus: report.syncStatus || report.sync_status || 'synced',
        isOutbreak: report.isOutbreak ?? report.is_outbreak ?? true
    };
}

function dedupeOutbreakReports(reports) {
    const seen = new Set();
    return reports.filter(report => {
        const key = report.id ? `id:${report.id}` : `key:${report.diseaseKey || ''}:${report.timestamp || ''}:${report.latitude ?? ''}:${report.longitude ?? ''}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function setMapStatus(message, tone = 'info') {
    const status = document.getElementById('map-status');
    if (!status) return;
    status.textContent = message;
    status.className = `map-status ${tone}`;
}

function updateOfflineStatus() {
    const offlineBanner = document.getElementById('offline-banner');
    if (offlineBanner) {
        offlineBanner.style.display = navigator.onLine ? 'none' : 'flex';
    }
}

function formatDiseaseLabel(value) {
    if (!value) return 'Disease report';
    return value.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}

function getDiseaseColor(diseaseName) {
    const name = (diseaseName || '').toLowerCase();
    if (name.includes('late blight')) return '#ef4444';
    if (name.includes('early blight')) return '#f59e0b';
    if (name.includes('mosaic') || name.includes('virus')) return '#8b5cf6';
    if (name.includes('bacterial')) return '#3b82f6';
    return '#22c55e';
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function getSyncLabel(report) {
    const status = (report.syncStatus || report.sync_status || 'synced').toLowerCase();
    if (status === 'pending') return 'Pending';
    return 'Synced';
}

function getRelativeTime(value) {
    try {
        const now = new Date();
        const stamp = new Date(value || Date.now());
        const diffMs = now - stamp;
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    } catch (error) {
        return 'recently';
    }
}

function renderSummary() {
    const totalEl = document.getElementById('stat-total');
    const communityEl = document.getElementById('stat-community');
    const localEl = document.getElementById('stat-local');
    const todayEl = document.getElementById('stat-today');
    const syncEl = document.getElementById('map-sync-pill');
    const listEl = document.getElementById('report-list');

    if (!totalEl) return;

    const total = outbreakReports.length;
    const community = outbreakReports.filter(report => report.source === 'community').length;
    const local = outbreakReports.filter(report => report.source !== 'community').length;
    const today = new Date().toLocaleDateString();
    const todayCount = outbreakReports.filter(report => {
        try { return new Date(report.timestamp).toLocaleDateString() === today; } catch (error) { return false; }
    }).length;

    const latestSynced = [...outbreakReports].filter(report => (report.syncStatus || report.sync_status || 'synced').toLowerCase() === 'synced').sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))[0];
    const syncText = latestSynced ? `Last sync: ${getRelativeTime(latestSynced.timestamp)}` : 'Sync status: standby';

    totalEl.textContent = total;
    communityEl.textContent = community;
    localEl.textContent = local;
    todayEl.textContent = todayCount;
    if (syncEl) syncEl.textContent = syncText;

    if (!listEl) return;

    if (outbreakReports.length === 0) {
        listEl.innerHTML = '<div class="map-empty">No reports yet. Your first community report will appear here.</div>';
        return;
    }

    const latest = [...outbreakReports]
        .sort((a, b) => new Date(b.timestamp || 0) - new Date(a.timestamp || 0))
        .slice(0, 6);

    listEl.innerHTML = latest.map(report => `
        <div class="report-item">
            <div>
                <strong>${formatDiseaseLabel(report.diseaseName || report.diseaseKey)}</strong>
                <div class="report-meta">${report.notes || 'No additional notes'}</div>
            </div>
            <div style="display:grid; gap:6px; justify-items:end;">
                <span class="report-badge">${report.source === 'community' ? 'Community' : 'Local'}</span>
                <span class="report-status ${getSyncLabel(report).toLowerCase()}">${getSyncLabel(report)}</span>
            </div>
        </div>
    `).join('');
}

async function loadOutbreakData() {
    outbreakReports = [];

    if (window.db) {
        try {
            const localOutbreaks = await window.db.getAll('outbreaks');
            if (Array.isArray(localOutbreaks) && localOutbreaks.length > 0) {
                outbreakReports = [...outbreakReports, ...localOutbreaks.map(normalizeOutbreakReport)];
            }
        } catch (error) {
            console.warn('Could not load outbreaks from IndexedDB:', error);
        }
    }

    if (typeof window.loadFromSupabase === 'function' && navigator.onLine) {
        try {
            const remoteReports = await window.loadFromSupabase('outbreaks');
            if (Array.isArray(remoteReports) && remoteReports.length > 0) {
                for (const report of remoteReports) {
                    const normalized = normalizeOutbreakReport(report);
                    const exists = outbreakReports.find(r => r.id === normalized.id);
                    if (!exists) {
                        outbreakReports.push(normalized);
                        if (window.db) {
                            await window.db.put('outbreaks', { ...normalized, sync_status: 'synced' });
                        }
                    }
                }
            }
        } catch (error) {
            console.warn('Could not load outbreaks from Supabase:', error);
        }
    }

    outbreakReports = dedupeOutbreakReports(outbreakReports.map(normalizeOutbreakReport));

    if (outbreakReports.length === 0) {
        outbreakReports = [...sampleReports];
    }

    updateOfflineStatus();
    renderSummary();
}

function addMapLegend() {
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function () {
        const div = L.DomUtil.create('div');
        div.className = 'map-legend';
        div.innerHTML = `
            <strong>Legend</strong>
            <div><span class="legend-dot red"></span>Late blight</div>
            <div><span class="legend-dot amber"></span>Early blight</div>
            <div><span class="legend-dot purple"></span>Viral disease</div>
            <div><span class="legend-dot blue"></span>Bacterial spot</div>
        `;
        return div;
    };
    legend.addTo(map);
}

async function loadAllMarkers() {
    if (!map || !markersCluster) return;

    markersCluster.clearLayers();
    currentHeatData = [];

    const filter = document.getElementById('map-filter')?.value || 'all';
    let filteredReports = [...outbreakReports];

    if (filter === 'tomato') {
        filteredReports = filteredReports.filter(report => (report.diseaseName || report.diseaseKey || '').toLowerCase().includes('tomato'));
    } else if (filter === 'potato') {
        filteredReports = filteredReports.filter(report => (report.diseaseName || report.diseaseKey || '').toLowerCase().includes('potato'));
    } else if (filter === 'last7') {
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        filteredReports = filteredReports.filter(report => new Date(report.timestamp || 0) >= cutoff);
    }

    filteredReports.forEach(report => {
        if (!report.latitude || !report.longitude) return;
        const color = getDiseaseColor(report.diseaseName || report.diseaseKey);
        const sourceLabel = report.source === 'community' ? 'Community report' : 'Local report';
        const popupHtml = `
            <div class="map-popup-card">
                <h4 class="map-popup-title">${formatDiseaseLabel(report.diseaseName || report.diseaseKey)}</h4>
                <div class="map-popup-meta">
                    <span class="map-popup-chip">${sourceLabel}</span>
                    <span class="map-popup-chip">${report.confidence || 'High concern'}</span>
                </div>
                <div class="map-popup-note">${report.notes || 'No extra notes were added for this report.'}</div>
                <div class="map-popup-meta">
                    <span>${getRelativeTime(report.timestamp)}</span>
                    <span>${getSyncLabel(report)}</span>
                </div>
            </div>
        `;
        const marker = L.marker([report.latitude, report.longitude], {
            icon: L.divIcon({
                html: `<div style="background:${color}; width:14px; height:14px; border-radius:50%; border:2px solid white; box-shadow:0 2px 8px rgba(0,0,0,0.35);"></div>`,
                iconSize: [14, 14]
            })
        }).bindPopup(popupHtml, { className: 'map-popup' });

        markersCluster.addLayer(marker);
        currentHeatData.push([report.latitude, report.longitude, report.source === 'community' ? 1 : 0.7]);
    });

    if (heatLayer) {
        map.removeLayer(heatLayer);
        heatLayer = null;
    }

    if (document.getElementById('btn-toggle-heatmap')?.textContent.includes('Hide')) {
        heatLayer = L.heatLayer(currentHeatData, { radius: 25, blur: 15, maxZoom: 10 }).addTo(map);
    }
}

function toggleHeatmap() {
    const btn = document.getElementById('btn-toggle-heatmap');
    if (!btn) return;
    if (!heatLayer) {
        if (currentHeatData.length > 0) {
            heatLayer = L.heatLayer(currentHeatData, { radius: 25, blur: 15, maxZoom: 10 }).addTo(map);
            btn.textContent = 'Hide heatmap';
            setMapStatus('Heatmap enabled', 'success');
        } else {
            setMapStatus('No outbreak points to visualize yet', 'warning');
        }
    } else {
        map.removeLayer(heatLayer);
        heatLayer = null;
        btn.textContent = 'Show heatmap';
        setMapStatus('Heatmap hidden', 'info');
    }
}

function centerMapOnUser() {
    if (!map) return;
    if (userLocation) {
        map.flyTo([userLocation.lat, userLocation.lng], 8, { duration: 1.2 });
        setMapStatus('Centered on your location', 'success');
    } else {
        map.flyTo([-1.2921, 36.8219], 6.5, { duration: 1.2 });
        setMapStatus('Using the default view', 'info');
    }
}

async function showOutbreaksNearMe() {
    if (!userLocation) {
        setMapStatus('Getting location access…', 'warning');
        getUserLocation();
        setTimeout(showOutbreaksNearMe, 1200);
        return;
    }

    const nearby = outbreakReports.filter(report => report.latitude && report.longitude && getDistance(userLocation.lat, userLocation.lng, report.latitude, report.longitude) <= 80);
    nearby.sort((a, b) => getDistance(userLocation.lat, userLocation.lng, a.latitude, a.longitude) - getDistance(userLocation.lat, userLocation.lng, b.latitude, b.longitude));

    if (nearby.length === 0) {
        setMapStatus('No nearby outbreak reports within 80km', 'info');
    } else {
        const preview = nearby.slice(0, 4).map(item => `${formatDiseaseLabel(item.diseaseName || item.diseaseKey)} (${getDistance(userLocation.lat, userLocation.lng, item.latitude, item.longitude).toFixed(0)}km)`).join(' • ');
        setMapStatus(`Nearby alerts: ${preview}`, 'success');
    }

    map.flyTo([userLocation.lat, userLocation.lng], 8.3, { duration: 1.2 });
}

function getUserLocation() {
    if (!navigator.geolocation) {
        userLocation = { lat: -1.2921, lng: 36.8219 };
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            userLocation = { lat: position.coords.latitude, lng: position.coords.longitude };
            setMapStatus('Location ready', 'success');
        },
        () => {
            userLocation = { lat: -1.2921, lng: 36.8219 };
            setMapStatus('Using Nairobi as the default view', 'info');
        },
        { timeout: 8000, enableHighAccuracy: false }
    );
}

function showReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.remove('hidden');
}

function hideReportModal() {
    const modal = document.getElementById('report-modal');
    if (modal) modal.classList.add('hidden');
}

async function submitCommunityReport() {
    const diseaseSelect = document.getElementById('report-disease');
    const notesInput = document.getElementById('report-notes');
    const diseaseName = diseaseSelect?.value || 'tomato late blight';
    const notes = notesInput?.value || '';

    let latitude = null;
    let longitude = null;

    if (navigator.geolocation) {
        try {
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 6000, enableHighAccuracy: false });
            });
            latitude = position.coords.latitude;
            longitude = position.coords.longitude;
        } catch (error) {
            console.warn('Location unavailable for report:', error);
        }
    }

    const reportEntry = {
        diseaseKey: diseaseName.toLowerCase(),
        diseaseName: diseaseName.replace(/_/g, ' '),
        confidence: '92%',
        latitude,
        longitude,
        notes,
        timestamp: new Date().toISOString(),
        source: 'community',
        syncStatus: 'pending',
        isOutbreak: true
    };

    try {
        hideReportModal();
        if (typeof window.syncToSupabase === 'function') {
            try {
                const syncedRecord = await window.syncToSupabase('outbreaks', reportEntry);
                showToast('Report saved to community', 'success');
            } catch (error) {
                console.error('Failed to save report:', error);
                showToast('Failed to save report. Please try again.', 'error');
            }
        }
        await loadOutbreakData();
        await loadAllMarkers();
        renderSummary();
        setMapStatus('Community report saved and pinned to the map', 'success');
    } catch (error) {
        console.error('Could not save community report:', error);
        setMapStatus('Report could not be saved. Please try again.', 'warning');
    }
}

async function initDiseaseMap() {
    const container = document.getElementById('disease-map');
    if (!container) return console.error('Map container not found');

    if (map) {
        map.remove();
        map = null;
    }

    map = L.map('disease-map', { zoomControl: false, attributionControl: false }).setView([-1.2921, 36.8219], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    markersCluster = L.markerClusterGroup({ maxClusterRadius: 45 });
    map.addLayer(markersCluster);

    addMapLegend();
    getUserLocation();

    document.getElementById('btn-report-outbreak')?.addEventListener('click', showReportModal);
    document.getElementById('cancel-report')?.addEventListener('click', hideReportModal);
    document.getElementById('submit-report')?.addEventListener('click', submitCommunityReport);
    document.getElementById('btn-center-map')?.addEventListener('click', centerMapOnUser);
    document.getElementById('btn-toggle-heatmap')?.addEventListener('click', toggleHeatmap);
    document.getElementById('btn-near-me')?.addEventListener('click', showOutbreaksNearMe);
    document.getElementById('map-filter')?.addEventListener('change', loadAllMarkers);
    document.getElementById('report-modal')?.addEventListener('click', (event) => {
        if (event.target.id === 'report-modal') hideReportModal();
    });

    await loadOutbreakData();
    await loadAllMarkers();
    setMapStatus(navigator.onLine ? 'Outbreak map ready' : 'Outbreak map ready (offline mode)', navigator.onLine ? 'success' : 'warning');
    await updateSupabaseStatus();
    
    window.addEventListener('online', () => {
        updateOfflineStatus();
        loadOutbreakData();
        loadAllMarkers();
    });
    window.addEventListener('offline', () => {
        updateOfflineStatus();
    });
}

async function updateSupabaseStatus() {
    const badge = document.getElementById('supabase-status');
    if (!badge) return;

    if (!navigator.onLine) {
        badge.textContent = 'Supabase status: offline';
        badge.className = 'map-status-badge offline';
        return;
    }

    badge.textContent = 'Supabase status: checking…';
    badge.className = 'map-status-badge';

    for (let attempt = 0; attempt < 10; attempt++) {
        if (typeof window.testSupabaseConnection === 'function') {
            try {
                const connected = await window.testSupabaseConnection();
                if (connected === true) {
                    badge.textContent = 'Supabase status: online';
                    badge.className = 'map-status-badge online';
                    return;
                } else {
                    badge.textContent = 'Supabase status: unavailable';
                    badge.className = 'map-status-badge error';
                    return;
                }
            } catch (error) {
                badge.textContent = 'Supabase status: error';
                badge.className = 'map-status-badge error';
                console.warn('Supabase status check failed:', error);
                return;
            }
        }
        await new Promise(resolve => setTimeout(resolve, 300));
    }

    badge.textContent = 'Supabase status: unavailable';
    badge.className = 'map-status-badge error';
}

window.initDiseaseMap = initDiseaseMap;
window.updateMapMarkers = loadAllMarkers;

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('disease-map')) {
        initDiseaseMap();
    }
});