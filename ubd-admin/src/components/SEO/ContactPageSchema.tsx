import StructuredData from './StructuredData';

export default function ContactPageSchema() {
  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Contact Us - UAE Business Desk',
    description: 'Get in touch with UAE Business Desk for company incorporation and bank account setup services. Submit your enquiry or contact us directly.',
    url: 'https://www.uaebusinessdesk.com/contact',
    inLanguage: 'en',
    isPartOf: {
      '@type': 'WebSite',
      name: 'UAE Business Desk',
      url: 'https://www.uaebusinessdesk.com',
    },
  };

  const contactPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'ContactPage',
    name: 'Contact Us - UAE Business Desk',
    description: 'Get in touch with UAE Business Desk for company incorporation and bank account setup services.',
    url: 'https://www.uaebusinessdesk.com/contact',
    mainEntity: {
      '@type': 'Organization',
      name: 'UAE Business Desk',
      url: 'https://www.uaebusinessdesk.com',
      logo: 'https://www.uaebusinessdesk.com/assets/header-logo.png',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+971-50-420-9110',
        contactType: 'Customer Service',
        email: 'support@uaebusinessdesk.com',
        areaServed: 'AE',
        availableLanguage: 'English',
      },
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'Business Center, Sharjah Publishing City',
        addressLocality: 'Sharjah',
        addressCountry: 'AE',
      },
    },
  };

  return (
    <>
      <StructuredData data={webPageSchema} />
      <StructuredData data={contactPageSchema} />
    </>
  );
}
