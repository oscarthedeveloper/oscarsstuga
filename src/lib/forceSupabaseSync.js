import { getSupabase } from '@site/src/lib/supabaseClient';

const PREFIX = 'oscarsstuga:';
const HP_PREFIX = 'oscarsstuga:hp:';
const HP_COLLECTIONS = new Set(['sessions', 'exams', 'meta']);

function storageKey(collection) {
  return HP_COLLECTIONS.has(collection) ? HP_PREFIX + collection : PREFIX + collection;
}

function localCollections() {
  const collections = new Map();
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index);
    if (!key || !key.startsWith(PREFIX)) continue;

    const collection = key.startsWith(HP_PREFIX)
      ? key.slice(HP_PREFIX.length)
      : key.slice(PREFIX.length);
    if (!collection) continue;

    try {
      collections.set(collection, JSON.parse(localStorage.getItem(key)));
    } catch {
      // En trasig lokal post ska inte hindra resten av synken.
    }
  }
  return collections;
}

async function authenticatedClient(supabaseUrl, supabaseAnonKey) {
  const supa = await getSupabase(supabaseUrl, supabaseAnonKey);
  if (!supa) throw new Error('Supabase är inte konfigurerat.');

  const { data, error } = await supa.auth.getUser();
  if (error || !data?.user) throw new Error('Du måste vara inloggad för att synka.');
  return { supa, user: data.user };
}

export async function forceUploadAll(supabaseUrl, supabaseAnonKey) {
  const { supa, user } = await authenticatedClient(supabaseUrl, supabaseAnonKey);
  const rows = Array.from(localCollections(), ([collection, data]) => ({
    user_id: user.id,
    collection,
    data,
  }));
  if (rows.length === 0) return 0;

  const { error } = await supa
    .from('user_data')
    .upsert(rows, { onConflict: 'user_id,collection' });
  if (error) throw error;
  return rows.length;
}

export async function forceDownloadAll(supabaseUrl, supabaseAnonKey) {
  const { supa, user } = await authenticatedClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supa
    .from('user_data')
    .select('collection, data')
    .eq('user_id', user.id);
  if (error) throw error;

  data.forEach(({ collection, data: value }) => {
    localStorage.setItem(storageKey(collection), JSON.stringify(value));
  });
  return data.length;
}
