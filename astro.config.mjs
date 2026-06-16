import { defineConfig } from 'astro/config';
import mermaid from 'astro-mermaid';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    mermaid(),
    starlight({
      title: 'Weather Starter',
      sidebar: [
        {
          label: 'Getting Started',
          items: [{ label: 'Overview', slug: 'index' }],
        },
        {
          label: 'System',
          items: [
            { label: 'Architecture', slug: 'architecture' },
            { label: 'Backend', slug: 'backend' },
            { label: 'Frontend', slug: 'frontend' },
          ],
        },
        {
          label: 'Working In The Repo',
          items: [{ label: 'Development', slug: 'development' }],
        },
      ],
    }),
  ],
});
