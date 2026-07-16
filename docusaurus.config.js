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

  // Kör på klienten: sätter viewport-fit=cover för iOS safe-area.
  clientModules: [require.resolve('./src/clientModules/viewport.js')],

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
    // Offline-stöd: service worker som förhandscachar sidan (fungerar som app
    // utan uppkoppling). Manifest/apple-taggar sätts via pwaHead nedan.
    [
      '@docusaurus/plugin-pwa',
      {
        debug: false,
        offlineModeActivationStrategies: ['appInstalled', 'standalone', 'queryString'],
        pwaHead: [
          { tagName: 'link', rel: 'manifest', href: '/manifest.json' },
          { tagName: 'link', rel: 'icon', href: '/img/icon-192.png' },
          { tagName: 'link', rel: 'apple-touch-icon', href: '/img/apple-touch-icon.png' },
          { tagName: 'meta', name: 'theme-color', content: '#f0ede7' },
          { tagName: 'meta', name: 'apple-mobile-web-app-capable', content: 'yes' },
          { tagName: 'meta', name: 'mobile-web-app-capable', content: 'yes' },
          { tagName: 'meta', name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
          { tagName: 'meta', name: 'apple-mobile-web-app-title', content: 'Oscars Stuga' },
        ],
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
