import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Bokens detaljsida. Läser ?id=<bok-id> och visar ord, uttryck och citat.
export default function BokPage() {
  return (
    <Layout title="Bok" description="Ord, uttryck och citat från boken">
      <main className="container margin-vert--lg">
        <BrowserOnly fallback={<div>Laddar…</div>}>
          {() => {
            const BookDetail = require('@site/src/components/Bocker/BookDetail').default;
            const id = new URLSearchParams(window.location.search).get('id');
            return <BookDetail bookId={id} />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
