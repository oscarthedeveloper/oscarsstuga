// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebarsMera = {
  meraSidebar: [
    {
      type: 'category',
      label: 'Projekt',
      collapsed: true,
      items: ['projekt/intro'],
    },
    {
      type: 'category',
      label: 'Teoretiska intressen',
      collapsed: true,
      items: [
        'teori/intro',
        'teori/scrimba',
        'teori/substack',
        'teori/bocker',
        'teori/fornsvensk-grammatik',
        'teori/svensk-sprakvard',
      ],
    },
  ],
};

export default sidebarsMera;
