import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Introduction',
      items: ['intro/welcome'],
    },
    {
      type: 'category',
      label: 'Guides',
      items: ['guides/architecture', 'guides/oracle-connectivity'],
    },
    {
      type: 'category',
      label: 'Monitoring Stack',
      items: ['monitoring/stack-overview', 'monitoring/influxdb-metrics'],
    },
  ],
};

export default sidebars;
