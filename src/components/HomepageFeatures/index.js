import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

const AREAS = [
  {
    title: 'Högskoleprovet',
    emoji: '📊',
    color: 'var(--orange)',
    to: '/hp',
    desc: 'Spåra dina delprov, följ utvecklingen och räkna ner till provdagen.',
  },
  {
    title: 'Språk',
    emoji: '🗣️',
    color: 'var(--blå)',
    to: '/sprak/italienska/',
    desc: 'Svenska, engelska, italienska och tyska — grammatik, ord och anteckningar.',
  },
  {
    title: 'Mera',
    emoji: '🧩',
    color: 'var(--lila)',
    to: '/mera/projekt/',
    desc: 'Projekt jag bygger i React samt teoretiska intressen — Scrimba, Substack, böcker och språkvård.',
  },
];

function AreaCard({title, emoji, color, to, desc}) {
  return (
    <Link to={to} className={styles.card} style={{'--card-accent': color}}>
      <span className={styles.cardAccent} style={{background: color}} />
      <span className={styles.cardEmoji}>{emoji}</span>
      <Heading as="h3" className={styles.cardTitle}>
        {title}
      </Heading>
      <p className={styles.cardDesc}>{desc}</p>
      <span className={styles.cardArrow}>→</span>
    </Link>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className={styles.grid}>
        {AREAS.map((a) => (
          <AreaCard key={a.title} {...a} />
        ))}
      </div>
    </section>
  );
}
