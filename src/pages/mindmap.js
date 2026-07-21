import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

// Fristående helskärmssida för Mindmap — ingen sidebar, ingen footer.
export default function MindmapPage() {
  return (
    <Layout title="Mindmap" description="En flytande idékarta" noFooter wrapperClassName="mindmapPageWrapper">
      <BrowserOnly fallback={<div style={{ padding: '2rem' }}>Laddar…</div>}>
        {() => {
          const Mindmap = require('@site/src/components/Mindmap/Mindmap').default;
          return <Mindmap fullscreen />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
