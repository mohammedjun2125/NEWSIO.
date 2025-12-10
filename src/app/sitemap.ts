import { MetadataRoute } from 'next';

const countries = ['us', 'uk', 'in'];
 
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://your-production-domain.com';

  const countryPages = countries.map((country) => ({
    url: `${baseUrl}/${country}`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    ...countryPages,
  ];
}
