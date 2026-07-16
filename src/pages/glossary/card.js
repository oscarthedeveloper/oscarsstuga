import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Glossary card detail page. Reads ?id=<card-id> and shows words + definitions + practice.
// Rendered only in the browser (localStorage/Supabase).

export default function GlossaryCardPage() {
  return (
    <Layout title="Glossary — card" description="Words, definitions and practice for the card">
      <main className="container margin-vert--lg">
        <BrowserOnly fallback={<div>Loading…</div>}>
          {() => {
            const CardDetail = require('@site/src/components/Glossary/CardDetail').default;
            const id = new URLSearchParams(window.location.search).get('id');
            return <CardDetail cardId={id} />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
