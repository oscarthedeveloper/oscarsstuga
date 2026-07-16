import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Kortets detaljsida. Läser ?id=<kort-id> och visar ord + definitioner + övning.
// Renderas endast i webbläsaren (localStorage/Supabase).

export default function OrdabokKortPage() {
  return (
    <Layout title="Ordabok — kort" description="Ord, definitioner och övning för kortet">
      <main className="container margin-vert--lg">
        <BrowserOnly fallback={<div>Laddar…</div>}>
          {() => {
            const CardDetail = require('@site/src/components/Ordabok/CardDetail').default;
            const id = new URLSearchParams(window.location.search).get('id');
            return <CardDetail cardId={id} />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
