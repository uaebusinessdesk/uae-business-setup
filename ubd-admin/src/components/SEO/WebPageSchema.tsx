import StructuredData from './StructuredData';

interface WebPageSchemaProps {
  name: string;
  description: string;
  url: string;
}

export default function WebPageSchema({ name, description, url }: WebPageSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name,
    description,
    url,
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'UAE Business Desk',
      url: 'https://www.uaebusinessdesk.com',
    },
  };

  return <StructuredData data={schema} />;
}
