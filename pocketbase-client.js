import PocketBase from './pocketbase.es.mjs';

const POCKETBASE_URL = 'http://127.0.0.1:8090';
export const pb = new PocketBase(POCKETBASE_URL);

export async function syncOutbreakToPocketBase(outbreak) {
    if (!outbreak || typeof outbreak !== 'object') {
        throw new Error('Invalid outbreak payload');
    }
    return await pb.collection('outbreaks').create(outbreak);
}

export async function loadOutbreaksFromPocketBase() {
    return await pb.collection('outbreaks').getFullList({ sort: '-created' });
}

export async function testPocketBaseConnection() {
    try {
        await pb.collection('outbreaks').getFirstListItem('', { sort: '-created' });
        console.log('✅ PocketBase connected successfully');
        return true;
    } catch (err) {
        const statusCode = err?.status || err?.data?.status;
        console.error('❌ PocketBase connection failed:', err.message || err);
        if (statusCode === 403 || String(err?.message || '').toLowerCase().includes('superuser')) {
            return 'forbidden';
        }
        return false;
    }
}

if (typeof window !== 'undefined') {
    window.pocketBase = pb;
    window.syncOutbreakToPocketBase = syncOutbreakToPocketBase;
    window.loadOutbreaksFromPocketBase = loadOutbreaksFromPocketBase;
    window.testPocketBaseConnection = testPocketBaseConnection;
}
