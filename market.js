const DEFAULT_PRICES = [
    { id: 'p1', crop: 'Tomato', variety: "Ng'ongo", county: 'Nairobi', price: 120, unit: 'kg', trend: 'up', change: '+8%', market: 'Wakulima Market', updated_at: new Date().toISOString() },
    { id: 'p2', crop: 'Tomato', variety: 'Money Maker', county: 'Kiambu', price: 105, unit: 'kg', trend: 'down', change: '-3%', market: 'Kiambu Open Air', updated_at: new Date().toISOString() },
    { id: 'p3', crop: 'Tomato', variety: "Ng'ongo", county: 'Nakuru', price: 115, unit: 'kg', trend: 'up', change: '+6%', market: 'Nakuru Market', updated_at: new Date().toISOString() },
    { id: 'p4', crop: 'Tomato', variety: 'Kileleshwa', county: 'Mombasa', price: 130, unit: 'kg', trend: 'up', change: '+10%', market: 'Mombasa Main Market', updated_at: new Date().toISOString() },
    { id: 'p5', crop: 'Potato', variety: 'Shangi', county: 'Nakuru', price: 45, unit: 'kg', trend: 'up', change: '+5%', market: 'Nakuru Market', updated_at: new Date().toISOString() },
    { id: 'p6', crop: 'Potato', variety: 'Kenya Mpya', county: 'Nyeri', price: 50, unit: 'kg', trend: 'stable', change: '0%', market: 'Nyeri Town Market', updated_at: new Date().toISOString() },
    { id: 'p7', crop: 'Potato', variety: 'Shangi', county: 'Eldoret', price: 42, unit: 'kg', trend: 'down', change: '-2%', market: 'Eldoret Grain Market', updated_at: new Date().toISOString() },
    { id: 'p8', crop: 'Potato', variety: 'Asante', county: 'Meru', price: 48, unit: 'kg', trend: 'up', change: '+4%', market: 'Meru Open Air', updated_at: new Date().toISOString() },
    { id: 'p9', crop: 'Cabbage', variety: 'Golden Acre', county: 'Kisumu', price: 35, unit: 'head', trend: 'down', change: '-6%', market: 'Kisumu Market', updated_at: new Date().toISOString() },
    { id: 'p10', crop: 'Cabbage', variety: 'Black Queen', county: 'Nairobi', price: 40, unit: 'head', trend: 'stable', change: '0%', market: 'Wakulima Market', updated_at: new Date().toISOString() },
    { id: 'p11', crop: 'Onion', variety: 'Red Creole', county: 'Mombasa', price: 150, unit: 'kg', trend: 'up', change: '+12%', market: 'Mombasa Main Market', updated_at: new Date().toISOString() },
    { id: 'p12', crop: 'Onion', variety: 'Red Creole', county: 'Nairobi', price: 140, unit: 'kg', trend: 'up', change: '+9%', market: 'Wakulima Market', updated_at: new Date().toISOString() },
    { id: 'p13', crop: 'Onion', variety: 'Bombay', county: 'Kiambu', price: 130, unit: 'kg', trend: 'stable', change: '0%', market: 'Kiambu Open Air', updated_at: new Date().toISOString() },
    { id: 'p14', crop: 'Maize', variety: 'DH04', county: 'Eldoret', price: 55, unit: 'kg', trend: 'stable', change: '0%', market: 'Eldoret Grain Market', updated_at: new Date().toISOString() },
    { id: 'p15', crop: 'Maize', variety: 'H614', county: 'Nakuru', price: 50, unit: 'kg', trend: 'down', change: '-4%', market: 'Nakuru Market', updated_at: new Date().toISOString() },
    { id: 'p16', crop: 'Maize', variety: 'H614', county: 'Kisumu', price: 52, unit: 'kg', trend: 'up', change: '+3%', market: 'Kisumu Market', updated_at: new Date().toISOString() },
    { id: 'p17', crop: 'Spinach', variety: 'Local', county: 'Nairobi', price: 60, unit: 'bunch', trend: 'up', change: '+4%', market: 'Wakulima Market', updated_at: new Date().toISOString() },
    { id: 'p18', crop: 'Spinach', variety: 'Local', county: 'Kiambu', price: 55, unit: 'bunch', trend: 'stable', change: '0%', market: 'Kiambu Open Air', updated_at: new Date().toISOString() },
    { id: 'p19', crop: 'Kale', variety: 'Sukuma Wiki', county: 'Kiambu', price: 25, unit: 'bunch', trend: 'stable', change: '0%', market: 'Kiambu Open Air', updated_at: new Date().toISOString() },
    { id: 'p20', crop: 'Kale', variety: 'Sukuma Wiki', county: 'Nairobi', price: 30, unit: 'bunch', trend: 'up', change: '+5%', market: 'Wakulima Market', updated_at: new Date().toISOString() },
    { id: 'p21', crop: 'Carrot', variety: 'Nzumbo', county: 'Nyeri', price: 90, unit: 'kg', trend: 'up', change: '+7%', market: 'Nyeri Town Market', updated_at: new Date().toISOString() },
    { id: 'p22', crop: 'Carrot', variety: 'Nzumbo', county: 'Nairobi', price: 100, unit: 'kg', trend: 'up', change: '+8%', market: 'Wakulima Market', updated_at: new Date().toISOString() },
    { id: 'p23', crop: 'Chilli', variety: 'Habanero', county: 'Meru', price: 180, unit: 'kg', trend: 'up', change: '+15%', market: 'Meru Open Air', updated_at: new Date().toISOString() },
    { id: 'p24', crop: 'Chilli', variety: 'Bird Eye', county: 'Kisumu', price: 160, unit: 'kg', trend: 'up', change: '+11%', market: 'Kisumu Market', updated_at: new Date().toISOString() },
    { id: 'p25', crop: 'Watermelon', variety: 'Sugarbaby', county: 'Kiambu', price: 40, unit: 'kg', trend: 'down', change: '-5%', market: 'Kiambu Open Air', updated_at: new Date().toISOString() },
    { id: 'p26', crop: 'Mango', variety: 'Apple', county: 'Mombasa', price: 120, unit: 'kg', trend: 'up', change: '+7%', market: 'Mombasa Main Market', updated_at: new Date().toISOString() },
    { id: 'p27', crop: 'Coffee', variety: 'Arabica', county: 'Nyeri', price: 280, unit: 'kg', trend: 'up', change: '+6%', market: 'Nyeri Town Market', updated_at: new Date().toISOString() },
    { id: 'p28', crop: 'Tea', variety: 'Purple', county: 'Kericho', price: 350, unit: 'kg', trend: 'up', change: '+4%', market: 'Kericho Market', updated_at: new Date().toISOString() },
    { id: 'p29', crop: 'Avocado', variety: 'Hass', county: 'Nairobi', price: 180, unit: 'kg', trend: 'up', change: '+18%', market: 'Wakulima Market', updated_at: new Date().toISOString() },
    { id: 'p30', crop: 'Passion', variety: 'Purple', county: 'Kisumu', price: 120, unit: 'kg', trend: 'up', change: '+9%', market: 'Kisumu Market', updated_at: new Date().toISOString() }
];

const DEFAULT_AGROVETS = [
    { id: 'a1', name: 'Kenya Agri Supplies Ltd', county: 'Nairobi', town: 'Nairobi CBD', phone: '+254 20 123 456', services: ['Seeds', 'Fertilizers', 'Chemicals', 'Advisory'], certified: true, rating: 4.5, location: { lat: -1.2921, lng: 36.8219 } },
    { id: 'a2', name: 'GreenGrow Agrovet', county: 'Kiambu', town: 'Kiambu Town', phone: '+254 720 111 222', services: ['Seeds', 'Organic Inputs', 'Tools'], certified: true, rating: 4.2, location: { lat: -1.1746, lng: 36.8344 } },
    { id: 'a3', name: 'Nakuru Farm Inputs', county: 'Nakuru', town: 'Nakuru Town', phone: '+254 51 321 987', services: ['Fertilizers', 'Chemicals', 'Irrigation'], certified: true, rating: 4.0, location: { lat: -0.3031, lng: 36.0800 } },
    { id: 'a4', name: 'Lake Agro Center', county: 'Kisumu', town: 'Kisumu CBD', phone: '+254 57 202 445', services: ['Seeds', 'Fertilizers', 'Pesticides'], certified: true, rating: 3.9, location: { lat: -0.1022, lng: 34.7617 } },
    { id: 'a5', name: 'Coastal Agri Store', county: 'Mombasa', town: 'Mombasa Island', phone: '+254 41 555 888', services: ['Seeds', 'Chemicals', 'Advisory'], certified: true, rating: 4.3, location: { lat: -4.0435, lng: 39.6682 } },
    { id: 'a6', name: 'Rift Valley Agrovet', county: 'Eldoret', town: 'Eldoret Town', phone: '+254 53 207 112', services: ['Seeds', 'Fertilizers', 'Animal Health'], certified: true, rating: 4.1, location: { lat: 0.5143, lng: 35.2698 } },
    { id: 'a7', name: 'Mount Kenya Agro', county: 'Nyeri', town: 'Nyeri Town', phone: '+254 61 203 990', services: ['Tea Inputs', 'Fertilizers', 'Tools'], certified: true, rating: 4.6, location: { lat: -0.4201, lng: 36.9478 } },
    { id: 'a8', name: 'Meru Agribusiness Hub', county: 'Meru', town: 'Meru Town', phone: '+254 64 312 771', services: ['Miraa Inputs', 'Fertilizers', 'Chemicals'], certified: true, rating: 4.0, location: { lat: 0.0470, lng: 37.6530 } },
    { id: 'a9', name: 'Smart Crop Solutions', county: 'Nairobi', town: 'Westlands', phone: '+254 711 222 333', services: ['Digital Advisory', 'Seeds', 'Precision Inputs'], certified: true, rating: 4.7, location: { lat: -1.2636, lng: 36.8036 } },
    { id: 'a10', name: 'Mavuno Agrovet', county: 'Kiambu', town: 'Thika', phone: '+254 67 514 892', services: ['Seeds', 'Irrigation', 'Tools'], certified: true, rating: 4.4, location: { lat: -1.0333, lng: 37.0833 } },
    { id: 'a11', name: 'Kapsoya Agrovet', county: 'Eldoret', town: 'Kapsoya', phone: '+254 53 207 445', services: ['Seeds', 'Fertilizers', 'Vet Services'], certified: true, rating: 4.3, location: { lat: 0.5143, lng: 35.2698 } },
    { id: 'a12', name: 'Kisumu Certified Agri', county: 'Kisumu', town: 'Kisumu West', phone: '+254 57 202 998', services: ['Seeds', 'Pesticides', 'Advisory'], certified: true, rating: 4.1, location: { lat: -0.1022, lng: 34.7617 } },
    { id: 'a13', name: 'Nairobi West Agrovet', county: 'Nairobi', town: 'Nairobi West', phone: '+254 20 567 123', services: ['Fertilizers', 'Tools', 'Animal Health'], certified: true, rating: 4.0, location: { lat: -1.3000, lng: 36.7800 } },
    { id: 'a14', name: 'Machakos Farmers Hub', county: 'Machakos', town: 'Machakos Town', phone: '+254 44 321 654', services: ['Seeds', 'Irrigation', 'Chemicals'], certified: true, rating: 4.2, location: { lat: -1.5167, lng: 37.2667 } },
    { id: 'a15', name: 'Garissa Agri Supplies', county: 'Garissa', town: 'Garissa Town', phone: '+254 46 201 789', services: ['Seeds', 'Fertilizers', 'Water Pumps'], certified: true, rating: 3.8, location: { lat: -0.4536, lng: 39.6401 } },
    { id: 'a16', name: 'Kajiado Farm Inputs', county: 'Kajiado', town: 'Kajiado Town', phone: '+254 45 302 456', services: ['Seeds', 'Vet Medicine', 'Fencing'], certified: true, rating: 4.0, location: { lat: -1.8523, lng: 36.7769 } },
    { id: 'a17', name: 'Nyeri Digital Agrovet', county: 'Nyeri', town: 'Nyeri Town', phone: '+254 61 203 771', services: ['Digital Advisory', 'Seeds', 'Fertilizers'], certified: true, rating: 4.8, location: { lat: -0.4201, lng: 36.9478 } },
    { id: 'a18', name: 'Mombasa Agro Link', county: 'Mombasa', town: 'Nyali', phone: '+254 41 555 223', services: ['Seeds', 'Chemicals', 'Irrigation'], certified: true, rating: 4.4, location: { lat: -4.0435, lng: 39.6682 } },
    { id: 'a19', name: 'Kiambu Certified Seeds', county: 'Kiambu', town: 'Kiambu Town', phone: '+254 720 444 123', services: ['Certified Seeds', 'Fertilizers', 'Training'], certified: true, rating: 4.6, location: { lat: -1.1746, lng: 36.8344 } },
    { id: 'a20', name: 'Nakuru Green Agrovet', county: 'Nakuru', town: 'Naivasha Rd', phone: '+254 51 987 654', services: ['Organic Inputs', 'Seeds', 'Advisory'], certified: true, rating: 4.1, location: { lat: -0.3031, lng: 36.0800 } }
];

const PRICE_TREND_EMOJI = { up: '📈', down: '📉', stable: '➡️' };

let allPrices = [...DEFAULT_PRICES];
let allAgrovets = [...DEFAULT_AGROVETS];

async function initMarketPage() {
    if (window.db) {
        try {
            const cachedPrices = await window.db.getAll('prices');
            if (cachedPrices.length > 0) {
                allPrices = cachedPrices;
            }
        } catch (error) {
            console.warn('Could not load cached prices:', error);
        }
    }
    
    if (navigator.onLine && typeof window.loadFromSupabase === 'function') {
        try {
            const remotePrices = await window.loadFromSupabase('market_prices');
            if (Array.isArray(remotePrices) && remotePrices.length > 0) {
                allPrices = remotePrices;
                if (window.db) {
                    for (const price of remotePrices) {
                        await window.db.put('prices', { ...price, sync_status: 'synced' });
                    }
                }
            }
        } catch (error) {
            console.warn('Could not sync prices from Supabase:', error);
        }
    }
    
    renderMarketPrices();
    renderAgrovets();
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('market-prices-list') || document.getElementById('agrovets-list')) {
        initMarketPage();
    }
    
    const refreshBtn = document.getElementById('btn-refresh-market');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async () => {
            if (!navigator.onLine) {
                showToast('You are offline. Showing cached data.', 'warning');
                await initMarketOffline();
                return;
            }
            
            refreshBtn.disabled = true;
            refreshBtn.textContent = 'Refreshing...';
            
            try {
                await initMarketPage();
                showToast('Market data refreshed', 'success');
            } catch (error) {
                showToast('Failed to refresh. Showing cached data.', 'error');
                await initMarketOffline();
            } finally {
                refreshBtn.disabled = false;
                refreshBtn.textContent = 'Refresh';
            }
        });
    }
});
