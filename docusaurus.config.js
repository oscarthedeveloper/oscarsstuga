// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Oscars Stuga',
  tagline: 'Studier, språk, projekt och teoretiska intressen',
  favicon: 'img/favicon.svg',

  future: {
    v4: true,
    faster: false,
  },

  customFields: {
    supabaseUrl: process.env.SUPABASE_URL || 'https://fugubcjxmmhgmizqwmpn.supabase.co',
    supabaseAnonKey:
      process.env.SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1Z3ViY2p4bW1oZ21penF3bXBuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQwNDUxMDQsImV4cCI6MjA5OTYyMTEwNH0.FrVfNauItKXJqvwg_QSeVWu583adrIfRDfG5JvX0VW4',
  },

  url: 'https://incandescent-youtiao-f3e14a.netlify.app',
  baseUrl: '/',

  organizationName: 'oscarthedeveloper',
  projectName: 'oscarsstuga',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'sv',
    locales: ['sv'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        // Gemensam språk-instans (Italienska, Spanska, Tyska)
        docs: {
          path: 'sprak',
          routeBasePath: 'sprak',
          sidebarPath: require.resolve('./sidebarsSprak.js'),
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'hogskoleprovet',
        path: 'hogskoleprovet',
        routeBasePath: 'hogskoleprovet',
        sidebarPath: require.resolve('./sidebarsHogskoleprovet.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'forstasprak',
        path: 'forstasprak',
        routeBasePath: 'forstasprak',
        sidebarPath: require.resolve('./sidebarsForstasprak.js'),
      },
    ],
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'mera',
        path: 'mera',
        routeBasePath: 'mera',
        sidebarPath: require.resolve('./sidebarsMera.js'),
      },
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/docusaurus-social-card.jpg',
      colorMode: {
        respectPrefersColorScheme: true,
      },
      // Endast en kategori kan vara utfälld i taget i sidebaren
      docs: {
        sidebar: {
          autoCollapseCategories: true,
        },
      },
      navbar: {
        title: 'Oscars Stuga',
        items: [
          {
            type: 'dropdown',
            label: 'Högskoleprovet',
            position: 'left',
            items: [
              {to: '/hp', label: 'HP-tracker'},
              {
                type: 'docSidebar',
                sidebarId: 'hogskoleprovetSidebar',
                docsPluginId: 'hogskoleprovet',
                label: 'Anteckningar',
              },
            ],
          },
          {
            type: 'dropdown',
            label: 'Språk',
            position: 'left',
            items: [
              {
                type: 'docSidebar',
                sidebarId: 'forstasprakSidebar',
                docsPluginId: 'forstasprak',
                label: 'Förstahandsspråk',
              },
              {type: 'doc', docId: 'italienska/intro', label: 'Andrahandsspråk'},
            ],
          },
          {
            type: 'docSidebar',
            sidebarId: 'meraSidebar',
            docsPluginId: 'mera',
            position: 'left',
            label: 'Mera',
          },
          {
            href: 'https://github.com/oscarthedeveloper/oscarsstuga',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'light',
        links: [],
        copyright:
          '<div class="footerBrand"><span class="footerBrandName">Oscars Stuga</span></div>',
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
