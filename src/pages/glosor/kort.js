import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Gloskortets övningssida. Läser ?id=<kort-id>. Endast i webbläsaren.
export default function GlosorKortPage() {
  return (
    <Layout title="Gemensam ordabok — kort" description="Öva ett korts glosor på alla andrahandsspråk">
      <main className="container margin-vert--lg">
        <BrowserOnly fallback={<div>Laddar…</div>}>
          {() => {
            const CardDrill = require('@site/src/components/Glosor/CardDrill').default;
            const id = new URLSearchParams(window.location.search).get('id');
            return <CardDrill cardId={id} />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
