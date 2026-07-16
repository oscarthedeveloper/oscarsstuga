import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Projektets detaljsida. Läser ?id=<projekt-id>. Endast i webbläsaren.
export default function ProjektDetaljPage() {
  return (
    <Layout title="Projekt — detalj" description="Detaljer, uppgifter och GitHub-aktivitet för projektet">
      <main className="container margin-vert--lg">
        <BrowserOnly fallback={<div>Laddar…</div>}>
          {() => {
            const ProjectDetail = require('@site/src/components/Projekt/ProjectDetail').default;
            const id = new URLSearchParams(window.location.search).get('id');
            return <ProjectDetail projectId={id} />;
          }}
        </BrowserOnly>
      </main>
    </Layout>
  );
}
