// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebarsItalienska = {
  italienskaSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Övningar',
      collapsed: false,
      items: ['ovningar/verbovning'],
    },
    {
      type: 'category',
      label: 'Grammatik',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: '👋 Introduktion',
          collapsed: false,
          items: ['grammatik/index', 'grammatik/acknowledgements'],
        },
        {
          type: 'category',
          label: '🔤 Grunder & uttal',
          items: [
            'grammatik/basics/alphabet',
            'grammatik/basics/pronunciation',
            'grammatik/basics/stress',
            'grammatik/basics/spelling',
          ],
        },
        {
          type: 'category',
          label: '⚡ Verb',
          items: [
            'grammatik/verbs/verb-intro',
            'grammatik/verbs/present-tense',
            'grammatik/verbs/regular-verbs',
            'grammatik/verbs/essere-avere',
            'grammatik/verbs/irregular-verbs',
            'grammatik/verbs/modal-verbs',
            'grammatik/verbs/reflexive-verbs',
            'grammatik/verbs/passato-prossimo',
            'grammatik/verbs/imperfetto',
            'grammatik/verbs/passato-remoto',
            'grammatik/verbs/trapassato',
            'grammatik/verbs/future',
            'grammatik/verbs/conditional',
            'grammatik/verbs/imperative',
            'grammatik/verbs/subjunctive',
            'grammatik/verbs/gerund-progressive',
            'grammatik/verbs/passive',
          ],
        },
        {
          type: 'category',
          label: '📦 Substantiv',
          items: [
            'grammatik/nouns/noun-intro',
            'grammatik/nouns/gender',
            'grammatik/nouns/plural',
            'grammatik/nouns/definite-article',
            'grammatik/nouns/indefinite-article',
            'grammatik/nouns/irregular-nouns',
            'grammatik/nouns/suffixes',
          ],
        },
        {
          type: 'category',
          label: '🎨 Adjektiv',
          items: [
            'grammatik/adjectives/adjective-intro',
            'grammatik/adjectives/agreement',
            'grammatik/adjectives/position',
            'grammatik/adjectives/comparison',
            'grammatik/adjectives/bello-buono-grande',
          ],
        },
        {
          type: 'category',
          label: '👥 Pronomen',
          items: [
            'grammatik/pronouns/pronoun-intro',
            'grammatik/pronouns/subject-pronouns',
            'grammatik/pronouns/direct-object',
            'grammatik/pronouns/indirect-object',
            'grammatik/pronouns/combined-pronouns',
            'grammatik/pronouns/ci-ne',
            'grammatik/pronouns/relative',
            'grammatik/pronouns/indefinite',
          ],
        },
        {
          type: 'category',
          label: '📍 Prepositioner',
          items: [
            'grammatik/prepositions/preposition-intro',
            'grammatik/prepositions/di-a-da',
            'grammatik/prepositions/in-con-su-per-tra',
            'grammatik/prepositions/articulated',
            'grammatik/prepositions/verbs-with-prepositions',
            'grammatik/prepositions/time-place',
          ],
        },
        {
          type: 'category',
          label: '🚀 Adverb',
          items: [
            'grammatik/adverbs/adverb-intro',
            'grammatik/adverbs/formation',
            'grammatik/adverbs/position',
          ],
        },
        {
          type: 'category',
          label: '🧩 Syntax',
          items: [
            'grammatik/syntax/syntax-intro',
            'grammatik/syntax/word-order',
            'grammatik/syntax/questions',
            'grammatik/syntax/negation',
            'grammatik/syntax/subordinate-clauses',
            'grammatik/syntax/conjunctions',
            'grammatik/syntax/si-constructions',
          ],
        },
        {
          type: 'category',
          label: '🔊 Ljudförändringar',
          items: [
            'grammatik/sound-changes/spelling-changes',
            'grammatik/sound-changes/elision-truncation',
          ],
        },
        {
          type: 'category',
          label: '📚 Referens',
          items: [
            'grammatik/reference/irregular-verbs-list',
            'grammatik/reference/conjugation-tables',
            'grammatik/reference/glossary',
          ],
        },
      ],
    },
  ],
};

export default sidebarsItalienska;
