import { BLOG_DESCRIPTION, EXPERIENCE_DESCRIPTION, SITE_DESCRIPTION, TAGS_DESCRIPTION } from '@/lib/site';

export type SearchEntry = {
  title: string;
  description: string;
  tags: string[];
  body: string;
  url: string;
};

export const PAGE_SEARCH_ENTRIES: SearchEntry[] = [
  {
    title: 'Home',
    description: SITE_DESCRIPTION,
    tags: [],
    body: 'Seasons is a neobrutalist Astro theme for personal sites and blogs. Its colors follow the calendar, moving through autumn, winter, spring, and summer, each with a light and a dark mode. Replace this card with a short introduction about yourself, and make it yours. What you get. Four seasons: autumn, winter, spring, and summer palettes that follow the calendar. Light and dark: every season has both modes, and the toggle remembers your choice. Blog ready: Markdown and MDX posts with tags, an RSS feed, and instant search.',
    url: '/',
  },
  {
    title: 'Blog',
    description: BLOG_DESCRIPTION,
    tags: [],
    body: 'All blog posts.',
    url: '/blog/',
  },
  {
    title: 'Tags',
    description: TAGS_DESCRIPTION,
    tags: [],
    body: 'Browse blog posts by tag.',
    url: '/tags/',
  },
  {
    title: 'Experience',
    description: EXPERIENCE_DESCRIPTION,
    tags: ['career', 'resume', 'work'],
    body: "Lead Engineer at Acme Corp (January 2023 to present): leads a small team that maintains the company's flagship platform, from planning the roadmap to reviewing pull requests, and shipped a staged migration to a modern frontend stack with no downtime.",
    url: '/experience/',
  },
];
