import StructuredData from './StructuredData';

export default function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'UAE Business Desk',
    url: 'https://www.uaebusinessdesk.com',
    logo: 'https://www.uaebusinessdesk.com/assets/header-logo.png',
    description: 'Expert UAE company setup and bank account services',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+971-50-420-9110',
      contactType: 'Customer Service',
      areaServed: 'AE',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://www.facebook.com/uaebusinessdeskuae',
      'https://www.linkedin.com/company/uaebusinessdesk/',
      'https://www.instagram.com/uaebusinessdesk/',
    ],
  };

  return <StructuredData data={schema} />;
}
