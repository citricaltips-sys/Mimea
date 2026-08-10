import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://hxjqajxgvlobglfoybnw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4anFhanhndmxvYmdsZm95Ym53Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYxMjY1NTYsImV4cCI6MjEwMTcwMjU1Nn0.ely2YSe263aD3iNibwPNJnesEn8us6qT25VbdJoj8NQ';

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

if (typeof window !== 'undefined') {
    window.supabase = supabase;
    window.syncToSupabase = syncToSupabase;
    window.loadFromSupabase = loadFromSupabase;
    window.testSupabaseConnection = testSupabaseConnection;
}
