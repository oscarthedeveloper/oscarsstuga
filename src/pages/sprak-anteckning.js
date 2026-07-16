import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

export default function SprakAnteckning() {
  return (
    <Layout title="Anteckning" description="Anteckning">
      <main className="container margin-vert--lg">
        <BrowserOnly fallback={<div />}>
          {() => {
            const NoteEditor = require('@site/src/components/Anteckningar/NoteEditor').default;
            const params = new URLSearchParams(window.location.search);
            const base = params.get('base') || 'sprak';
            const lang = params.get('lang') || '';
            const id = params.get('id') || '';
            return <NoteEditor base={base} lang={lang} id={id} />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
