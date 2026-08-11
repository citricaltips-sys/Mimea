const ADMIN_PIN = '1234';

function initAdminPage() {
    if (!window.auth || !window.auth.isAdmin()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const pinOverlay = document.getElementById('admin-pin-overlay');
    const adminContent = document.getElementById('admin-content');
    const pinForm = document.getElementById('admin-pin-form');
    const pinInput = document.getElementById('admin-pin-input');
    const pinError = document.getElementById('admin-pin-error');

    if (!pinOverlay || !adminContent) return;

    adminContent.style.display = 'none';
    pinOverlay.style.display = 'flex';

    pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const entered = pinInput.value.trim();
        if (entered === ADMIN_PIN) {
            pinOverlay.style.display = 'none';
            adminContent.style.display = 'block';
            setupTabs();
            setupPriceForm();
            setupAgrovetForm();
            loadPrices();
            loadAgrovets();
        } else {
            pinError.style.display = 'block';
            pinInput.value = '';
            pinInput.focus();
        }
    });
}

function setupTabs() {
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.querySelectorAll('.admin-tab-content').forEach(content => content.classList.remove('active'));
            document.getElementById(`tab-${target}`).classList.add('active');
        });
    });
}

// ==================== PRICES ====================
function setupPriceForm() {
    const form = document.getElementById('price-form');
    const cancelBtn = document.getElementById('price-cancel');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('price-id').value;
        const payload = {
            crop: document.getElementById('price-crop').value,
            variety: document.getElementById('price-variety').value || '',
            county: document.getElementById('price-county').value,
            price: parseFloat(document.getElementById('price-price').value),
            unit: document.getElementById('price-unit').value,
            trend: document.getElementById('price-trend').value,
            change: document.getElementById('price-change').value || '0%',
            market: document.getElementById('price-market').value || '',
            updated_at: new Date().toISOString()
        };

        try {
            if (id) {
                await window.supabase.from('market_prices').update(payload).eq('id', id);
                showToast('Price updated', 'success');
            } else {
                await window.supabase.from('market_prices').insert([payload]);
                showToast('Price added', 'success');
            }
            form.reset();
            document.getElementById('price-id').value = '';
            document.getElementById('price-form-title').textContent = 'Add Price';
            cancelBtn.style.display = 'none';
            loadPrices();
        } catch (err) {
            console.error('Price save failed:', err);
            showToast('Failed to save price', 'error');
        }
    });

    cancelBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('price-id').value = '';
        document.getElementById('price-form-title').textContent = 'Add Price';
        cancelBtn.style.display = 'none';
    });
}

async function loadPrices() {
    const container = document.getElementById('prices-admin-list');
    if (!container) return;

    try {
        const { data, error } = await window.supabase.from('market_prices').select('*').order('updated_at', { ascending: false });
        if (error) throw error;
        const prices = data || [];

        if (prices.length === 0) {
            container.innerHTML = '<div class="empty-state">No prices yet. Add your first price above.</div>';
            return;
        }

        container.innerHTML = prices.map(price => `
            <div class="admin-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                    <div>
                        <h4>${price.crop} ${price.variety ? '<span style="color:var(--text-muted); font-weight:500;">• ' + price.variety + '</span>' : ''}</h4>
                        <p>📍 ${price.market || price.county} • KES ${price.price}/${price.unit} • ${price.trend} ${price.change}</p>
                        <p style="font-size:0.8rem;">Updated: ${new Date(price.updated_at).toLocaleString()}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="btn-sm btn-outline" onclick="window.editPrice('${price.id}')">Edit</button>
                        <button class="btn-sm btn-danger" onclick="window.deletePrice('${price.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Failed to load prices:', err);
        container.innerHTML = '<div class="empty-state">Failed to load prices. Check console.</div>';
    }
}

window.editPrice = async function(id) {
    try {
        const { data, error } = await window.supabase.from('market_prices').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return;

        document.getElementById('price-id').value = data.id;
        document.getElementById('price-crop').value = data.crop;
        document.getElementById('price-variety').value = data.variety || '';
        document.getElementById('price-county').value = data.county;
        document.getElementById('price-price').value = data.price;
        document.getElementById('price-unit').value = data.unit || 'kg';
        document.getElementById('price-trend').value = data.trend || 'stable';
        document.getElementById('price-change').value = data.change || '0%';
        document.getElementById('price-market').value = data.market || '';
        document.getElementById('price-form-title').textContent = 'Edit Price';
        document.getElementById('price-cancel').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Failed to load price for edit:', err);
        showToast('Failed to load price', 'error');
    }
};

window.deletePrice = async function(id) {
    if (!confirm('Delete this price?')) return;
    try {
        const { error } = await window.supabase.from('market_prices').delete().eq('id', id);
        if (error) throw error;
        showToast('Price deleted', 'success');
        loadPrices();
    } catch (err) {
        console.error('Failed to delete price:', err);
        showToast('Failed to delete price', 'error');
    }
};

// ==================== AGROVETS ====================
function setupAgrovetForm() {
    const form = document.getElementById('agrovet-form');
    const cancelBtn = document.getElementById('agrovet-cancel');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('agrovet-id').value;
        const servicesRaw = document.getElementById('agrovet-services').value;
        const services = servicesRaw.split(',').map(s => s.trim()).filter(Boolean);

        const payload = {
            name: document.getElementById('agrovet-name').value,
            county: document.getElementById('agrovet-county').value,
            town: document.getElementById('agrovet-town').value || '',
            phone: document.getElementById('agrovet-phone').value || '',
            services: services,
            certified: document.getElementById('agrovet-certified').value === 'true',
            rating: parseFloat(document.getElementById('agrovet-rating').value) || 4.0,
            latitude: parseFloat(document.getElementById('agrovet-lat').value) || null,
            longitude: parseFloat(document.getElementById('agrovet-lng').value) || null
        };

        try {
            if (id) {
                await window.supabase.from('agrovets').update(payload).eq('id', id);
                showToast('Agrovet updated', 'success');
            } else {
                await window.supabase.from('agrovets').insert([payload]);
                showToast('Agrovet added', 'success');
            }
            form.reset();
            document.getElementById('agrovet-id').value = '';
            document.getElementById('agrovet-form-title').textContent = 'Add Agrovet';
            cancelBtn.style.display = 'none';
            loadAgrovets();
        } catch (err) {
            console.error('Agrovet save failed:', err);
            showToast('Failed to save agrovet', 'error');
        }
    });

    cancelBtn.addEventListener('click', () => {
        form.reset();
        document.getElementById('agrovet-id').value = '';
        document.getElementById('agrovet-form-title').textContent = 'Add Agrovet';
        cancelBtn.style.display = 'none';
    });
}

async function loadAgrovets() {
    const container = document.getElementById('agrovets-admin-list');
    if (!container) return;

    try {
        const { data, error } = await window.supabase.from('agrovets').select('*').order('name');
        if (error) throw error;
        const agrovets = data || [];

        if (agrovets.length === 0) {
            container.innerHTML = '<div class="empty-state">No agrovets yet. Add your first entry above.</div>';
            return;
        }

        container.innerHTML = agrovets.map(a => `
            <div class="admin-card">
                <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
                    <div>
                        <h4>${a.name} ${a.certified ? '<span style="color:#4ade80; font-size:0.8rem;">✓ Certified</span>' : ''}</h4>
                        <p>📍 ${a.town || a.county}, ${a.county} • 📞 ${a.phone || 'N/A'} • ⭐ ${a.rating || 'N/A'}</p>
                        <p style="font-size:0.85rem;">${(a.services || []).join(', ') || 'No services listed'}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="btn-sm btn-outline" onclick="window.editAgrovet('${a.id}')">Edit</button>
                        <button class="btn-sm btn-danger" onclick="window.deleteAgrovet('${a.id}')">Delete</button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Failed to load agrovets:', err);
        container.innerHTML = '<div class="empty-state">Failed to load agrovets. Check console.</div>';
    }
}

window.editAgrovet = async function(id) {
    try {
        const { data, error } = await window.supabase.from('agrovets').select('*').eq('id', id).single();
        if (error) throw error;
        if (!data) return;

        document.getElementById('agrovet-id').value = data.id;
        document.getElementById('agrovet-name').value = data.name;
        document.getElementById('agrovet-county').value = data.county;
        document.getElementById('agrovet-town').value = data.town || '';
        document.getElementById('agrovet-phone').value = data.phone || '';
        document.getElementById('agrovet-services').value = (data.services || []).join(', ');
        document.getElementById('agrovet-certified').value = data.certified ? 'true' : 'false';
        document.getElementById('agrovet-rating').value = data.rating || 4.0;
        document.getElementById('agrovet-lat').value = data.latitude || '';
        document.getElementById('agrovet-lng').value = data.longitude || '';
        document.getElementById('agrovet-form-title').textContent = 'Edit Agrovet';
        document.getElementById('agrovet-cancel').style.display = 'inline-block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
        console.error('Failed to load agrovet for edit:', err);
        showToast('Failed to load agrovet', 'error');
    }
};

window.deleteAgrovet = async function(id) {
    if (!confirm('Delete this agrovet?')) return;
    try {
        const { error } = await window.supabase.from('agrovets').delete().eq('id', id);
        if (error) throw error;
        showToast('Agrovet deleted', 'success');
        loadAgrovets();
    } catch (err) {
        console.error('Failed to delete agrovet:', err);
        showToast('Failed to delete agrovet', 'error');
    }
};

// Toast helper
function showToast(message, type = 'info', duration = 3000) {
    const existing = document.querySelector('.custom-toast');
    if (existing) existing.remove();
    const colors = { success: '#3fb950', error: '#f85149', warning: '#d29922', info: '#58a6ff' };
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `position:fixed; bottom:24px; left:50%; transform:translateX(-50%) translateY(100px); background:${colors[type] || colors.info}; color:white; padding:12px 24px; border-radius:10px; font-size:14px; font-weight:500; font-family:'Plus Jakarta Sans',sans-serif; z-index:10000; box-shadow:0 8px 24px rgba(0,0,0,0.3); transition:transform 0.3s cubic-bezier(0.16,1,0.3,1); max-width:90vw;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.transform = 'translateX(-50%) translateY(0)'; });
    setTimeout(() => { toast.style.transform = 'translateX(-50%) translateY(100px)'; setTimeout(() => toast.remove(), 300); }, duration);
}

document.addEventListener('DOMContentLoaded', initAdminPage);
