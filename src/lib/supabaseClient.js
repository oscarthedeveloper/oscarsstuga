// Supabase-klient för HP-trackern.
//
// Nycklarna läses från Docusaurus customFields (se docusaurus.config.js).
// Fyll i SUPABASE_URL och SUPABASE_ANON_KEY där — eller sätt dem som
// miljövariabler när du bygger. Saknas de körs trackern i localStorage-only-läge.
//
// @supabase/supabase-js laddas dynamiskt så att server-side-renderingen
// (Docusaurus bygger sidorna i Node) aldrig försöker skapa en klient.

let _clientPromise = null;

export function getSupabase(url, anonKey) {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (!url || !anonKey) return Promise.resolve(null);
  if (_clientPromise) return _clientPromise;

  _clientPromise = import('@supabase/supabase-js')
    .then(({ createClient }) => createClient(url, anonKey))
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[hp] Kunde inte ladda Supabase:', err?.message);
      return null;
    });

  return _clientPromise;
}
