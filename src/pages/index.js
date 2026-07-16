import React from 'react';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

// Lågkontrastigt, dimhöljt bergslandskap — stämning, inte huvudmotiv.
function Mountains() {
  return (
    <svg
      className={styles.mountains}
      viewBox="0 0 1440 620"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id="fog" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" className={styles.fogStop} stopOpacity="0" />
          <stop offset="72%" className={styles.fogStop} stopOpacity="0.55" />
          <stop offset="100%" className={styles.fogStop} stopOpacity="1" />
        </linearGradient>
      </defs>
      <path
        className={styles.ridgeBack}
        d="M0 372 L180 300 L360 348 L560 286 L760 340 L980 296 L1200 346 L1440 312 L1440 620 L0 620 Z"
      />
      <path
        className={styles.ridgeMid}
        d="M0 442 L240 384 L470 428 L700 362 L940 420 L1180 372 L1440 410 L1440 620 L0 620 Z"
      />
      <path
        className={styles.ridgeFront}
        d="M0 512 L300 462 L600 512 L880 456 L1160 510 L1440 470 L1440 620 L0 620 Z"
      />
      <rect x="0" y="180" width="1440" height="440" fill="url(#fog)" />
    </svg>
  );
}

const SECTIONS = [
  {
    n: '01',
    title: 'Högskoleprovet',
    desc: 'Delprov, utveckling och nedräkning till provdagen.',
    to: '/hp',
  },
  {
    n: '02',
    title: 'Språk',
    desc: 'Svenska, engelska, italienska, spanska och tyska — grammatik, ord och anteckningar.',
    to: '/forstasprak/svenska/',
  },
  {
    n: '03',
    title: 'Mera',
    desc: 'Projekt jag bygger i React och mina teoretiska intressen.',
    to: '/mera/projekt/',
  },
];

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Oscars Stuga — en samlingsplats för studier, språk, projekt och teoretiska intressen."
    >
      <div className={styles.page}>
        <header className={styles.hero}>
          <Mountains />
          <div className={styles.heroInner}>
            <div className={styles.heroGrid}>
              <div className={styles.heroMain}>
                <p className={styles.kicker}>Oscars Stuga</p>
                <Heading as="h1" className={styles.title}>
                  Ett eget rum för studier, språk och allt däremellan.
                </Heading>
              </div>

              <aside className={styles.heroAside}>
                <p className={styles.lead}>
                  Min samlingsplats för högskoleprovet, språken jag lär mig, projekten jag
                  bygger och tankarna jag samlar vid sidan av.
                </p>
                <div className={styles.actions}>
                  <Link className={styles.cta} to="/hp">
                    Till HP-trackern
                    <span className={styles.ctaArrow} aria-hidden="true">&rarr;</span>
                  </Link>
                  <Link className={styles.ctaGhost} to="/forstasprak/svenska/">
                    Utforska språken
                  </Link>
                </div>
              </aside>
            </div>
          </div>
        </header>

        <section className={styles.index}>
          <div className={styles.indexInner}>
            <p className={styles.indexLabel}>Innehåll</p>
            <ol className={styles.indexList}>
              {SECTIONS.map((s) => (
                <li key={s.n} className={styles.row}>
                  <Link className={styles.rowLink} to={s.to}>
                    <span className={styles.rowNum}>{s.n}</span>
                    <span className={styles.rowTitle}>{s.title}</span>
                    <span className={styles.rowDesc}>{s.desc}</span>
                    <span className={styles.rowArrow} aria-hidden="true">&rarr;</span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </div>
    </Layout>
  );
}
