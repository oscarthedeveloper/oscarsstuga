import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// HP-trackern använder localStorage och Supabase (webbläsar-API:er), så den
// renderas endast i webbläsaren — aldrig under Docusaurus server-rendering.

export default function HPPage() {
  return (
    <Layout title="Högskoleprov" description="Spåra dina högskoleprovsstudier">
      <main className="container margin-vert--lg">
        <BrowserOnly fallback={<div>Laddar…</div>}>
          {() => {
            const HPTracker = require('@site/src/components/HP/HPTracker').default;
            return <HPTracker />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
