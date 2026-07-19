// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebarsMera = {
  meraSidebar: [
    'data',
    {
      type: 'category',
      label: 'Projekt',
      collapsed: true,
      items: ['projekt/intro'],
    },
    'bocker',
    {
      type: 'category',
      label: 'Fornsvenska',
      collapsed: true,
      items: ['fornsvenska/referenser', 'fornsvenska/anteckningar'],
    },
  ],
};

export default sidebarsMera;
