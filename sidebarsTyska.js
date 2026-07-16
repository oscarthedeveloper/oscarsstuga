// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebarsTyska = {
  tyskaSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Övningar',
      collapsed: false,
      items: ['ovningar/konjugationsovning', 'ovningar/deklinationsovning'],
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
          label: '🔤 Grunderna & uttal',
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
            'grammatik/verbs/weak-verbs',
            'grammatik/verbs/strong-verbs',
            'grammatik/verbs/sein-haben-werden',
            'grammatik/verbs/modal-verbs',
            'grammatik/verbs/separable-verbs',
            'grammatik/verbs/perfect-tense',
            'grammatik/verbs/simple-past',
            'grammatik/verbs/past-perfect',
            'grammatik/verbs/future',
            'grammatik/verbs/imperative',
            'grammatik/verbs/subjunctive-2',
            'grammatik/verbs/subjunctive-1',
            'grammatik/verbs/passive',
            'grammatik/verbs/reflexive-verbs',
            'grammatik/verbs/infinitive-clauses',
            'grammatik/verbs/verb-government',
            'grammatik/verbs/verbs-with-prepositions',
          ],
        },
        {
          type: 'category',
          label: '📦 Substantiv',
          items: [
            'grammatik/nouns/noun-intro',
            'grammatik/nouns/gender',
            'grammatik/nouns/plural',
            'grammatik/nouns/cases',
            'grammatik/nouns/articles',
            'grammatik/nouns/weak-nouns',
            'grammatik/nouns/compound-nouns',
          ],
        },
        {
          type: 'category',
          label: '🎨 Adjektiv',
          items: [
            'grammatik/adjectives/adjective-intro',
            'grammatik/adjectives/declension',
            'grammatik/adjectives/comparison',
            'grammatik/adjectives/adjectival-nouns',
            'grammatik/adjectives/participles',
            'grammatik/adjectives/adjectives-with-prepositions',
          ],
        },
        {
          type: 'category',
          label: '👥 Pronomen',
          items: [
            'grammatik/pronouns/pronoun-intro',
            'grammatik/pronouns/personal',
            'grammatik/pronouns/possessive',
            'grammatik/pronouns/reflexive',
            'grammatik/pronouns/demonstrative',
            'grammatik/pronouns/relative',
            'grammatik/pronouns/interrogative',
            'grammatik/pronouns/indefinite',
          ],
        },
        {
          type: 'category',
          label: '📍 Prepositioner',
          items: [
            'grammatik/prepositions/preposition-intro',
            'grammatik/prepositions/accusative',
            'grammatik/prepositions/dative',
            'grammatik/prepositions/two-way',
            'grammatik/prepositions/genitive',
            'grammatik/prepositions/contractions',
          ],
        },
        {
          type: 'category',
          label: '🚀 Adverb',
          items: [
            'grammatik/adverbs/adverb-intro',
            'grammatik/adverbs/types',
            'grammatik/adverbs/modal-particles',
          ],
        },
        {
          type: 'category',
          label: '🔢 Räkneord & tid',
          items: [
            'grammatik/numbers/cardinal-numbers',
            'grammatik/numbers/ordinals-dates',
            'grammatik/numbers/time',
          ],
        },
        {
          type: 'category',
          label: '🧩 Syntax',
          items: [
            'grammatik/syntax/syntax-intro',
            'grammatik/syntax/main-clauses',
            'grammatik/syntax/questions',
            'grammatik/syntax/subordinate-clauses',
            'grammatik/syntax/conjunctions',
            'grammatik/syntax/negation',
            'grammatik/syntax/word-order',
            'grammatik/syntax/commas',
          ],
        },
        {
          type: 'category',
          label: '🔊 Ljudförändringar',
          items: ['grammatik/sound-changes/umlaut', 'grammatik/sound-changes/ablaut'],
        },
        {
          type: 'category',
          label: '📚 Referens',
          items: [
            'grammatik/reference/strong-verbs-list',
            'grammatik/reference/declension-tables',
            'grammatik/reference/glossary',
          ],
        },
      ],
    },
  ],
};

export default sidebarsTyska;
