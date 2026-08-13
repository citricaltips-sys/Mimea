import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://hxjqajxgvlobglfoybnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4anFjanhndmxvYmdsZm95Ym53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjY1NTYsImV4cCI6MjEwMTcwMjU1Nn0.ely2YSe263aD3iNibwPNJnesEn8us6qT25VbdJoj8NQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

function normalizeRecord(record, type = 'outbreak') {
  const diseaseKey = record.diseaseKey || record.disease_key || '';
  const base = {
    disease_key: diseaseKey.toLowerCase().trim(),
    disease_name: record.diseaseName || record.disease_name || diseaseKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    crop_type: record.cropType || (diseaseKey.includes('tomato') ? 'Tomato' : 'Potato'),
    confidence: Number(record.confidence) || 0,
    timestamp: record.timestamp || new Date().toISOString(),
    source: record.source || 'community',
    notes: record.notes || '',
  };

  if (type === 'scan') {
    return {
      ...base,
      latitude: record.latitude ?? null,
      longitude: record.longitude ?? null,
      coordinates: record.coordinates || '',
      sync_status: 'pending',
      is_outbreak: false,
    };
  }

  return {
    ...base,
    latitude: record.latitude ?? null,
    longitude: record.longitude ?? null,
    sync_status: 'synced',
    is_outbreak: true,
  };
}

export async function syncToSupabase(table, record) {
  if (!record || typeof record !== 'object') {
    throw new Error('Invalid record payload');
  }
  const normalized = normalizeRecord(record, table === 'scans' ? 'scan' : 'outbreak');
  const { data, error } = await supabase
    .from(table)
    .insert([normalized])
    .select();
  if (error) throw error;
  return data[0];
}

export async function loadFromSupabase(table) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase
      .from('outbreaks')
      .select('count');
    if (error) throw error;
    console.log('✅ Supabase connected successfully');
    return true;
  } catch (err) {
    console.error('❌ Supabase connection failed:', err.message || err);
    return false;
  }
}

export async function saveRecordOffline(table, record) {
  if (!window.db) {
    console.warn('IndexedDB not available, falling back to memory');
    return record;
  }
  
  const id = record.id || crypto.randomUUID ? crypto.randomUUID() : 
    'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  
  const offlineRecord = {
    ...record,
    id,
    sync_status: 'pending',
    created_at: record.timestamp || new Date().toISOString()
  };
  
  await window.db.put(table, offlineRecord);
  await window.db.addToQueue(table, offlineRecord);
  
  return offlineRecord;
}

export async function processSyncQueue() {
  if (!navigator.onLine || !window.db) return;
  
  const queue = await window.db.getQueue();
  const results = { synced: 0, failed: 0 };
  
  for (const item of queue) {
    try {
      const normalized = normalizeRecord(item.payload, item.type);
      const { data, error } = await supabase
        .from(item.type)
        .insert([normalized])
        .select();
      
      if (error) {
        console.error(`Sync failed for ${item.type}:`, error);
        results.failed++;
        continue;
      }
      
      if (data && data[0]) {
        await window.db.put(item.type, { ...data[0], sync_status: 'synced' });
      }
      
      await window.db.removeFromQueue(item.id);
      results.synced++;
    } catch (error) {
      console.error(`Sync error for ${item.type}:`, error);
      results.failed++;
    }
  }
  
  return results;
}

export async function loadOfflineData(table) {
  if (!window.db) return [];
  
  try {
    const localData = await window.db.getAll(table);
    const syncedData = localData.filter(r => r.sync_status === 'synced');
    const pendingData = localData.filter(r => r.sync_status === 'pending');
    return [...syncedData, ...pendingData];
  } catch (error) {
    console.error('Failed to load offline data:', error);
    return [];
  }
}

export async function clearOfflineData(table) {
  if (!window.db) return;
  await window.db.clear(table);
}

if (typeof window !== 'undefined') {
  window.supabase = supabase;
  window.syncToSupabase = syncToSupabase;
  window.loadFromSupabase = loadFromSupabase;
  window.testSupabaseConnection = testSupabaseConnection;
  window.saveRecordOffline = saveRecordOffline;
  window.processSyncQueue = processSyncQueue;
  window.loadOfflineData = loadOfflineData;
  window.clearOfflineData = clearOfflineData;
}
