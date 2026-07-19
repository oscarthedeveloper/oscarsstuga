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
            const params = new URLSearchParams(window.location.search);
            const id = params.get('id');
            const collection = params.get('col') || 'ordabok_cards';
            const back = params.get('back') || '/forstasprak/svenska/ordabok';
            return <CardDetail cardId={id} collection={collection} back={back} />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
