const DB_NAME = 'mimeahub-offline';
const DB_VERSION = 1;

let dbInstance = null;

function openDB() {
  if (dbInstance) return Promise.resolve(dbInstance);
  
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      dbInstance = request.result;
      resolve(dbInstance);
    };
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('scans')) {
        const scanStore = db.createObjectStore('scans', { keyPath: 'id' });
        scanStore.createIndex('sync_status', 'sync_status', { unique: false });
        scanStore.createIndex('timestamp', 'timestamp', { unique: false });
        scanStore.createIndex('diseaseKey', 'diseaseKey', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('outbreaks')) {
        const outbreakStore = db.createObjectStore('outbreaks', { keyPath: 'id' });
        outbreakStore.createIndex('sync_status', 'sync_status', { unique: false });
        outbreakStore.createIndex('timestamp', 'timestamp', { unique: false });
        outbreakStore.createIndex('diseaseKey', 'diseaseKey', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('prices')) {
        const priceStore = db.createObjectStore('prices', { keyPath: 'id' });
        priceStore.createIndex('sync_status', 'sync_status', { unique: false });
        priceStore.createIndex('crop', 'crop', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('agrovets')) {
        const agrovetStore = db.createObjectStore('agrovets', { keyPath: 'id' });
        agrovetStore.createIndex('county', 'county', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('queue')) {
        const queueStore = db.createObjectStore('queue', { keyPath: 'id', autoIncrement: true });
        queueStore.createIndex('type', 'type', { unique: false });
        queueStore.createIndex('created_at', 'created_at', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('remedies')) {
        db.createObjectStore('remedies', { keyPath: 'key' });
      }
      
      if (!db.objectStoreNames.contains('settings')) {
        db.createObjectStore('settings', { keyPath: 'key' });
      }
    };
  });
}

function generateId() {
  return crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
}

function now() {
  return new Date().toISOString();
}

const db = {
  async init() {
    await openDB();
    await this.seedDefaults();
  },

  async seedDefaults() {
    const defaultRemedies = [
      { key: 'healthy_tomato', title: 'Healthy Tomato', organic: 'No treatment needed! Maintain good soil with compost and mulch.', chemical: 'No chemical treatment needed.', prevention: 'Continue regular monitoring, water consistently at base, and rotate crops annually.' },
      { key: 'tomato_late_blight', title: 'Tomato Late Blight', organic: 'Apply copper-based fungicides every 5-7 days. Baking soda spray. Remove and destroy infected plants immediately.', chemical: 'Mancozeb, Ridomil Gold, or Chlorothalonil. Apply preventively before disease appears.', prevention: 'Plant resistant varieties. Space plants for airflow. Water at base. Monitor weather for cool, wet conditions.' },
      { key: 'tomato_early_blight', title: 'Tomato Early Blight', organic: 'Remove infected lower leaves. Apply neem oil or copper spray every 7 days. Use compost tea to boost immunity.', chemical: 'Chlorothalonil, Mancozeb, or Azoxystrobin. Apply at first sign of disease.', prevention: 'Mulch around plants. Rotate crops for 3-4 years. Stake plants. Water at base.' },
      { key: 'tomato_mosaic_virus', title: 'Tomato Mosaic Virus', organic: 'Remove and destroy infected plants immediately. Disinfect tools with 10% bleach solution. Control aphids with neem oil spray.', chemical: 'No direct chemical treatment for virus. Control aphid vectors with imidacloprid or acetamiprid insecticides.', prevention: 'Use resistant varieties. Wash hands before handling plants. Don\'t smoke near plants. Control weeds.' },
      { key: 'tomato_yellow_curl_virus', title: 'Tomato Yellow Leaf Curl Virus', organic: 'Remove infected plants. Use neem oil or insecticidal soap against whiteflies. Install yellow sticky traps.', chemical: 'Control whitefly vectors with imidacloprid, thiamethoxam, or pyriproxyfen.', prevention: 'Use resistant varieties. Install fine mesh netting. Remove weeds that host whiteflies.' },
      { key: 'tomato_spider_mites', title: 'Tomato Spider Mites', organic: 'Spray plants with strong water jet. Apply neem oil or insecticidal soap every 5-7 days. Introduce predatory mites.', chemical: 'Use abamectin, spiromesifen, or bifenthrin. Rotate miticides to prevent resistance.', prevention: 'Increase humidity around plants. Avoid water stress. Remove dust from leaves.' },
      { key: 'tomato_septoria_leaf_spot', title: 'Tomato Septoria Leaf Spot', organic: 'Remove infected lower leaves. Apply copper-based fungicides every 7-10 days. Use baking soda spray.', chemical: 'Chlorothalonil or Mancozeb applied every 7-14 days. Start before disease appears.', prevention: 'Mulch heavily to prevent soil splash. Water at base only. Rotate crops for 3 years.' },
      { key: 'tomato_leaf_mold', title: 'Tomato Leaf Mold', organic: 'Improve ventilation. Remove infected leaves. Apply copper fungicide or sulfur spray.', chemical: 'Chlorothalonil, Mancozeb, or Azoxystrobin. Apply preventively in humid conditions.', prevention: 'Reduce humidity. Space plants properly. Water at base. Use drip irrigation.' },
      { key: 'tomato_bacterial_spot', title: 'Tomato Bacterial Spot', organic: 'Remove infected leaves and fruits. Apply copper-based bactericides.', chemical: 'Copper hydroxide + mancozeb combination.', prevention: 'Use certified disease-free seeds. Avoid overhead watering. Don\'t handle wet plants.' },
      { key: 'healthy_potato', title: 'Healthy Potato', organic: 'No treatment needed! Maintain soil fertility with compost and proper hilling.', chemical: 'No chemical treatment needed.', prevention: 'Use certified seed potatoes. Practice crop rotation. Monitor for beetles and aphids.' },
      { key: 'potato_late_blight', title: 'Potato Late Blight', organic: 'Remove and destroy infected foliage. Apply copper fungicides preventively. Hill soil around plants.', chemical: 'Ridomil Gold, Mancozeb, Chlorothalonil, or Fluazinam. Apply preventively before wet periods.', prevention: 'Use certified seed potatoes. Plant resistant varieties. Destroy volunteer potatoes.' },
      { key: 'potato_early_blight', title: 'Potato Early Blight', organic: 'Remove infected leaves. Apply neem oil or copper spray every 7-10 days.', chemical: 'Chlorothalonil, Mancozeb, or Azoxystrobin. Apply preventively.', prevention: 'Rotate crops for 3-4 years. Use certified seed. Avoid overhead irrigation.' }
    ];

    for (const remedy of defaultRemedies) {
      await this.put('remedies', remedy);
    }
  },

  async get(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getAll(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async put(storeName, record) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(record);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async delete(storeName, key) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(key);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async clear(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.clear();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  },

  async count(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  },

  async getPending(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const index = store.index('sync_status');
      const request = index.getAll('pending');
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || []);
    });
  },

  async markSynced(storeName, id) {
    const record = await this.get(storeName, id);
    if (record) {
      record.sync_status = 'synced';
      record.synced_at = now();
      await this.put(storeName, record);
    }
  },

  async addToQueue(type, payload) {
    const queueItem = {
      type,
      payload,
      created_at: now(),
      attempts: 0
    };
    return this.put('queue', queueItem);
  },

  async getQueue() {
    return this.getAll('queue');
  },

  async removeFromQueue(id) {
    return this.delete('queue', id);
  },

  createScanRecord(diseaseKey, confidence, coordinates = '') {
    return {
      id: generateId(),
      diseaseKey,
      confidence: Number(confidence) || 0,
      timestamp: now(),
      coordinates,
      sync_status: navigator.onLine ? 'pending' : 'pending',
      source: 'local'
    };
  },

  createOutbreakRecord(diseaseKey, confidence, notes = '', coordinates = '') {
    return {
      id: generateId(),
      diseaseKey: diseaseKey.toLowerCase().trim(),
      diseaseName: diseaseKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      confidence: parseFloat(confidence) || 0,
      timestamp: now(),
      coordinates,
      notes: notes || '',
      sync_status: 'pending',
      source: 'community'
    };
  }
};

window.db = db;
